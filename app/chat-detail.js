// app/chat-detail.js

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Animated,
  Keyboard,
  Dimensions,
  StatusBar,
  Alert
} from 'react-native';
import * as Clipboard from 'expo-clipboard'; 
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import MessageBubble from '../components/MessageBubble';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';

// Sample messages data
const MESSAGES_DATA = {
  'chat1': [
    {
      id: 1,
      text: "Hey! Ready for our match tonight? 🏸",
      timestamp: "11:28 AM",
      isSender: false,
      sender: "Regina",
      status: null,
      reactions: ['❤️', '👍'],
      replyTo: null
    },
    {
      id: 2,
      text: "Yes, definitely! I've been practicing those serve techniques you showed me",
      timestamp: "11:29 AM",
      isSender: true,
      sender: "You",
      status: "read",
      reactions: ['🔥'],
      replyTo: {
        id: 1,
        text: "Hey! Ready for our match tonight? 🏸",
        sender: "Regina"
      }
    },
    {
      id: 3,
      text: "See you at the courts! 🏸",
      timestamp: "11:30 AM",
      isSender: false,
      sender: "Regina",
      status: null,
      reactions: [],
      replyTo: null
    }
  ],
  'chat2': [
    {
      id: 1,
      text: "Great game yesterday!",
      timestamp: "9:15 AM",
      isSender: false,
      sender: "Mike Liu",
      status: null,
      reactions: [],
      replyTo: null
    }
  ],
  'chat3': [
    {
      id: 1,
      text: "Thanks for the tips! When can we practice again?",
      timestamp: "Yesterday",
      isSender: false,
      sender: "John Lemington",
      status: null,
      reactions: [],
      replyTo: null
    }
  ],
  'community1': [
    {
      id: 1,
      sender: "Mike Liu",
      text: "Anyone up for doubles tonight?",
      timestamp: "10:45 AM",
      isSender: false,
      status: null,
      reactions: [],
      replyTo: null
    },
    {
      id: 2,
      sender: "Regina",
      text: "I'm in! 🏸",
      timestamp: "10:47 AM",
      isSender: false,
      status: null,
      reactions: [],
      replyTo: null
    },
    {
      id: 3,
      text: "Count me in too!",
      timestamp: "10:50 AM",
      isSender: true,
      sender: "You",
      status: "delivered",
      reactions: [],
      replyTo: null
    }
  ]
};

// Chat user data
const CHAT_USERS = {
  'chat1': {
    name: "Regina ❤️",
    avatar: require('../assets/avatars/avatar1.jpg'),
    isOnline: true,
    typing: false
  },
  'chat2': {
    name: "Mike Liu",
    avatar: require('../assets/avatars/avatarX.jpg'),
    isOnline: true,
    typing: false
  },
  'chat3': {
    name: "John Lemington",
    avatar: require('../assets/avatars/avatar4.jpg'),
    isOnline: false,
    typing: true
  },
  'community1': {
    name: "Taicang Badminton Club",
    image: require('../assets/groups/group1.jpg'),
    memberCount: 128,
    type: 'community'
  }
};

export default function ChatDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const attachmentAnim = useRef(new Animated.Value(0)).current;
  const replyAnim = useRef(new Animated.Value(0)).current;

  const chatData = CHAT_USERS[params.chatId];
  const messages = MESSAGES_DATA[params.chatId] || [];
  const isCommunity = chatData?.type === 'community';

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const formatTimestamp = (timestamp) => {
    if (timestamp === 'Just now') {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return timestamp;
  };

  const handleReply = useCallback((msg) => {
    if (!msg) return;
    setReplyingTo({
      id: msg.id,
      text: msg.text,
      sender: msg.sender
    });
    inputRef.current?.focus();
    Animated.spring(replyAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 65
    }).start();
  }, []);

  const handleCopy = useCallback((text) => {
    Clipboard.setString(text);
    Alert.alert('Copied to Clipboard', 'The message has been copied.');
  }, []);

  const handleForward = useCallback((msg) => {
    console.log('Forward message:', msg);
    Alert.alert('Forward', 'Message forwarded successfully.');
  }, []);

  const handleDelete = useCallback((messageId) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedMessages = MESSAGES_DATA[params.chatId].filter(m => m.id !== messageId);
            MESSAGES_DATA[params.chatId] = updatedMessages;
            setMessage(prev => prev);
            console.log('Deleted message with ID:', messageId);
          }
        }
      ]
    );
  }, [params.chatId]);

  const cancelReply = useCallback(() => {
    Animated.spring(replyAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 65
    }).start(() => setReplyingTo(null));
  }, []);

  const handleReact = useCallback((messageId, reaction) => {
    const messageIndex = MESSAGES_DATA[params.chatId].findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      const msg = MESSAGES_DATA[params.chatId][messageIndex];
      if (msg.reactions) {
        if (!msg.reactions.includes(reaction)) {
          msg.reactions = [...msg.reactions, reaction];
        } else {
          msg.reactions = msg.reactions.filter(r => r !== reaction);
        }
      } else {
        msg.reactions = [reaction];
      }
      MESSAGES_DATA[params.chatId] = [...MESSAGES_DATA[params.chatId]];
      setMessage(prev => prev);
    }
  }, [params.chatId]);

  const toggleAttachments = useCallback(() => {
    Keyboard.dismiss();
    setShowAttachments(!showAttachments);
    Animated.spring(attachmentAnim, {
      toValue: showAttachments ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 65
    }).start();
  }, [showAttachments]);

  const handleAttachment = useCallback((type) => {
    console.log('Handling attachment:', type);
    Alert.alert('Attachment', `Selected: ${type}`);
    toggleAttachments();
  }, [toggleAttachments]);

  const handleSend = useCallback(() => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message.trim(),
      timestamp: formatTimestamp('Just now'),
      isSender: true,
      sender: "You",
      status: "sent",
      reactions: [],
      replyTo: replyingTo ? {
        id: replyingTo.id,
        text: replyingTo.text,
        sender: replyingTo.sender
      } : null
    };

    MESSAGES_DATA[params.chatId] = [...(MESSAGES_DATA[params.chatId] || []), newMessage];
    setMessage('');
    Animated.spring(replyAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 65
    }).start(() => {
      setReplyingTo(null);
    });

    setTimeout(() => scrollToBottom(), 100);

    setTimeout(() => {
      const messageIndex = MESSAGES_DATA[params.chatId].findIndex(m => m.id === newMessage.id);
      if (messageIndex !== -1) {
        MESSAGES_DATA[params.chatId][messageIndex].status = 'delivered';
        setMessage(prev => prev);
      }
    }, 1000);

    setTimeout(() => {
      const messageIndex = MESSAGES_DATA[params.chatId].findIndex(m => m.id === newMessage.id);
      if (messageIndex !== -1) {
        MESSAGES_DATA[params.chatId][messageIndex].status = 'read';
        setMessage(prev => prev);
      }
    }, 2000);

  }, [message, params.chatId, replyingTo, scrollToBottom, formatTimestamp]);

  const getItemLayout = useCallback((data, index) => ({
    length: 100, 
    offset: 100 * index,
    index,
  }), []);

  const renderMessage = useCallback(({ item }) => (
    <MessageBubble 
      message={item} 
      isCommunity={isCommunity}
      onReply={handleReply}
      onCopy={handleCopy}
      onForward={handleForward}
      onDelete={handleDelete}
      onReaction={handleReact}
    />
  ), [isCommunity, handleReply, handleCopy, handleForward, handleDelete, handleReact]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const keyboardHeight = e.endCoordinates.height;
        if (flatListRef.current) {
          flatListRef.current.setNativeProps({
            contentContainerStyle: {
              paddingBottom: keyboardHeight + 120
            }
          });
        }
        setTimeout(() => scrollToBottom(), 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        if (flatListRef.current) {
          flatListRef.current.setNativeProps({
            contentContainerStyle: {
              paddingBottom: 32
            }
          });
        }
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [scrollToBottom]);

  const attachmentOptions = [
    { id: 'camera', icon: 'camera', label: 'Camera', color: '#4CAF50' },
    { id: 'gallery', icon: 'images', label: 'Gallery', color: '#2196F3' },
    { id: 'document', icon: 'document-text', label: 'Document', color: '#FF9800' },
    { id: 'location', icon: 'location', label: 'Location', color: '#F44336' },
    { id: 'contact', icon: 'person', label: 'Contact', color: '#9C27B0' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_GREEN} />
      <LinearGradient
        colors={[DARK_GREEN, PRIMARY_GREEN]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push(`/profile/${params.chatId}`)}
          >
            <Image 
              source={chatData?.avatar || chatData?.image} 
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {chatData?.name}
                {isCommunity && (
                  <Text style={styles.memberCount}>
                    {' '}• {chatData.memberCount} members
                  </Text>
                )}
              </Text>
              {!isCommunity && (
                <Text style={styles.profileStatus}>
                  {chatData?.typing ? 'typing...' : 
                    (chatData?.isOnline ? 'Online' : 'Offline')}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          getItemLayout={getItemLayout}
          removeClippedSubviews={Platform.OS === 'android'}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />

        {replyingTo && (
          <Animated.View 
            style={[
              styles.replyBar,
              {
                transform: [{
                  translateY: replyAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  })
                }],
                opacity: replyAnim
              }
            ]}
          >
            <View style={styles.replyPreview}>
              <View style={styles.replyLine} />
              <View style={styles.replyContent}>
                <Text style={styles.replyName}>
                  {replyingTo.sender}
                </Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {replyingTo.text}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeReplyButton}
                onPress={cancelReply}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <BlurView intensity={80} tint="light" style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity 
              style={[styles.attachButton, showAttachments && styles.attachButtonActive]}
              onPress={toggleAttachments}
            >
              <Ionicons 
                name={showAttachments ? "close" : "add-circle"} 
                size={24} 
                color={showAttachments ? '#f44336' : PRIMARY_GREEN} 
              />
            </TouchableOpacity>
            
            <TextInput
              ref={inputRef}
              style={[styles.input, isInputFocused && styles.inputFocused]}
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              onFocus={() => {
                setIsInputFocused(true);
                scrollToBottom();
              }}
              onBlur={() => setIsInputFocused(false)}
              multiline
              maxHeight={100}
            />
            
            <TouchableOpacity 
              style={[styles.sendButton, message.length > 0 && styles.sendButtonActive]}
              onPress={handleSend}
              disabled={message.length === 0}
            >
              <Ionicons 
                name="send" 
                size={24} 
                color={message.length > 0 ? '#fff' : '#999'} 
              />
            </TouchableOpacity>
          </View>
        </BlurView>

        <Animated.View style={[styles.attachmentMenu, {
          transform: [{
            translateY: attachmentAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [200, 0]
            })
          }],
          opacity: attachmentAnim
        }]}>
          <View style={styles.attachmentGrid}>
            {attachmentOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={styles.attachmentOption}
                onPress={() => handleAttachment(option.id)}
              >
                <View style={[
                  styles.attachmentIcon,
                  { backgroundColor: `${option.color}20` }
                ]}>
                  <Ionicons 
                    name={option.icon} 
                    size={24} 
                    color={option.color} 
                  />
                </View>
                <Text style={styles.attachmentLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '400',
  },
  profileStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80,
  },
  replyBar: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  replyLine: {
    width: 4,
    height: '100%',
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
    marginRight: 8,
  },
  replyName: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_GREEN,
    marginBottom: 2,
  },
  replyText: {
    fontSize: 14,
    color: '#666',
  },
  closeReplyButton: {
    padding: 4,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '0deg' }],
  },
  attachButtonActive: {
    transform: [{ rotate: '45deg' }],
    backgroundColor: '#ffebee',
  },
  input: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputFocused: {
    borderColor: PRIMARY_GREEN,
    backgroundColor: '#fff',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: PRIMARY_GREEN,
  },
  attachmentMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  attachmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
  },
  attachmentOption: {
    alignItems: 'center',
    width: '18%',
  },
  attachmentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
