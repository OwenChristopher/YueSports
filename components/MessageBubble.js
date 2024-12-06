import React, { useState, useRef, useCallback, memo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet, 
  Platform,
  Animated,
  Modal,
  UIManager,
  findNodeHandle
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY_GREEN = '#2e7d32';

const ReactionBar = memo(({ onSelect, position, style }) => {
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  return (
    <View style={[styles.reactionBarContainer, style, position === 'right' ? { right: -10 } : { left: -10 }]}>
      <View style={styles.reactionBar}>
        {reactions.map((reaction) => (
          <TouchableOpacity
            key={reaction}
            style={styles.reactionButton}
            onPress={() => onSelect(reaction)}
          >
            <Text style={styles.reactionEmoji}>{reaction}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addReactionButton}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const MessageActions = memo(({ onAction, position, style }) => {
  const actions = [
    { id: 'reply', icon: 'arrow-undo', label: 'Reply' },
    { id: 'copy', icon: 'copy', label: 'Copy' },
    { id: 'forward', icon: 'arrow-redo', label: 'Forward' },
    { id: 'edit', icon: 'create', label: 'Edit' },
    { id: 'info', icon: 'information-circle', label: 'Info' },
    { id: 'star', icon: 'star', label: 'Star' },
    { id: 'delete', icon: 'trash', label: 'Delete', destructive: true }
  ];

  return (
    <View style={[
      styles.actionsMenu,
      style,
      position === 'right' ? styles.actionsMenuRight : styles.actionsMenuLeft
    ]}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionButton}
          onPress={() => onAction(action.id)}
        >
          <Ionicons 
            name={action.icon} 
            size={20} 
            color={action.destructive ? '#ff4444' : '#fff'} 
          />
          <Text style={[
            styles.actionText,
            action.destructive && styles.actionTextDestructive
          ]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const MessageBubble = memo(({
  message,
  isCommunity,
  onReply,
  onCopy,
  onForward,
  onDelete,
  onReaction
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [bubbleLayout, setBubbleLayout] = useState(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bubbleRef = useRef(null);

  const measureMessageBubble = () => {
    const handle = findNodeHandle(bubbleRef.current);
    if (!handle) return;
    UIManager.measureInWindow(handle, (x, y, width, height) => {
      setBubbleLayout({ x, y, width, height });
      setIsSelected(true);
      setShowActions(true); 
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleLongPress = useCallback(() => {
    measureMessageBubble();
  }, []);

  const handleDismiss = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => {
      setIsSelected(false);
      setShowActions(false);
      setBubbleLayout(null);
    });
  }, []);

  const handleAction = useCallback((actionType) => {
    switch (actionType) {
      case 'reply':
        onReply?.(message);
        break;
      case 'copy':
        onCopy?.(message.text);
        break;
      case 'forward':
        onForward?.(message);
        break;
      case 'delete':
        onDelete?.(message.id);
        break;
      default:
        break;
    }
    handleDismiss();
  }, [message, onReply, onCopy, onForward, onDelete, handleDismiss]);

  const handleReaction = useCallback((reaction) => {
    onReaction?.(message.id, reaction);
    handleDismiss();
  }, [message.id, onReaction, handleDismiss]);

  const renderReplyPreview = () => {
    if (!message.replyTo) return null;
    // Combine sender and message in one line for consistent formatting
    return (
      <View style={[styles.replyContainer]}>
        <View style={styles.replyLine} />
        <Text 
          style={styles.replyCombined} 
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {message.replyTo.sender}: {message.replyTo.text}
        </Text>
      </View>
    );
  };

  const MessageContent = (
    <Animated.View 
      ref={bubbleRef}
      style={[
        styles.messageBubble,
        message.isSender ? styles.senderBubble : styles.receiverBubble,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      {renderReplyPreview()}
      {isCommunity && !message.isSender && (
        <Text style={styles.senderName}>{message.sender}</Text>
      )}
      <Text style={[
        styles.messageText,
        message.isSender ? styles.senderText : styles.receiverText
      ]}>
        {message.text}
      </Text>
      <View style={styles.messageFooter}>
        <Text style={[
          styles.timestamp,
          message.isSender ? styles.senderTimestamp : styles.receiverTimestamp
        ]}>
          {message.timestamp}
        </Text>
        {message.isSender && (
          <Ionicons 
            name="checkmark" 
            size={14} 
            color="rgba(255,255,255,0.7)" 
            style={styles.statusIcon}
          />
        )}
      </View>
    </Animated.View>
  );

  return (
    <>
      <View style={[
        styles.container,
        message.isSender ? styles.senderContainer : styles.receiverContainer
      ]}>
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          activeOpacity={0.9}
        >
          {MessageContent}
        </TouchableOpacity>

        {message.reactions?.length > 0 && (
          <View style={[
            styles.reactionsContainer,
            message.isSender ? styles.senderReactions : styles.receiverReactions
          ]}>
            {message.reactions.map((reaction, index) => (
              <Text key={index} style={styles.displayedReaction}>
                {reaction}
              </Text>
            ))}
          </View>
        )}
      </View>

      {isSelected && bubbleLayout && (
        <Modal
          transparent
          animationType="fade"
          visible={isSelected}
          onRequestClose={handleDismiss}
        >
          <BlurView 
            style={StyleSheet.absoluteFill}
            tint="dark"
            intensity={30}
          >
            <TouchableOpacity 
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={handleDismiss}
            />
          </BlurView>

          {/* Cloned message bubble in exact position */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: bubbleLayout.y,
              left: bubbleLayout.x,
              width: bubbleLayout.width,
              height: bubbleLayout.height,
            }}
          >
            {MessageContent}
          </View>

          {/* Reaction Bar above the bubble */}
          <ReactionBar
            onSelect={handleReaction}
            position={message.isSender ? 'right' : 'left'}
            style={{
              position: 'absolute',
              top: bubbleLayout.y - 60,
              left: message.isSender
                ? (bubbleLayout.x + bubbleLayout.width - 280) 
                : bubbleLayout.x,
            }}
          />

          {/* Actions menu below the bubble */}
          {showActions && (
            <MessageActions
              onAction={handleAction}
              position={message.isSender ? 'right' : 'left'}
              style={{
                position: 'absolute',
                top: bubbleLayout.y + bubbleLayout.height + 8,
                left: message.isSender
                  ? (bubbleLayout.x + bubbleLayout.width - 180)
                  : bubbleLayout.x,
              }}
            />
          )}
        </Modal>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
    position: 'relative',
  },
  senderContainer: {
    alignSelf: 'flex-end',
    marginLeft: 50,
  },
  receiverContainer: {
    alignSelf: 'flex-start',
    marginRight: 50,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 12,
    minWidth: 80,
    maxWidth: '100%',
  },
  senderBubble: {
    backgroundColor: PRIMARY_GREEN,
    borderTopRightRadius: 4,
  },
  receiverBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'stretch', 
    marginBottom: 10, 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 12, 
    backgroundColor: 'rgba(255,255,255,0.1)',
    minHeight: 40, 
  },
  replyLine: {
    width: 3, 
    alignSelf: 'stretch',
    backgroundColor: PRIMARY_GREEN,
    marginRight: 10, 
    borderRadius: 1.5, 
  },
  replyCombined: {
    fontSize: 14, 
    color: '#fff',
    flexShrink: 1,
    lineHeight: 20, 
    alignSelf: 'center', 
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  senderText: {
    color: '#fff',
  },
  receiverText: {
    color: '#000',
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY_GREEN,
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
  senderTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  receiverTimestamp: {
    color: '#8e8e8e',
  },
  statusIcon: {
    marginLeft: 2,
  },
  reactionBarContainer: {
    zIndex: 1000,
  },
  reactionBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 24,
    padding: 4,
    alignItems: 'center',
  },
  reactionButton: {
    padding: 8,
  },
  addReactionButton: {
    padding: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
  },
  reactionEmoji: {
    fontSize: 22,
  },
  actionsMenu: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 14,
    padding: 8,
    minWidth: 180,
    zIndex: 1000,
  },
  actionsMenuLeft: {},
  actionsMenuRight: {},
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  actionTextDestructive: {
    color: '#ff4444',
  },
  reactionsContainer: {
    position: 'absolute',
    bottom: -12,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  senderReactions: {
    right: 8,
  },
  receiverReactions: {
    left: 8,
  },
  displayedReaction: {
    fontSize: 14,
    paddingHorizontal: 2,
  },
});

export default MessageBubble;
