// app/(tabs)/chat.js
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  Dimensions,
  Animated
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const LIGHT_GREEN = '#4caf50';

// Simulated chat data
const CHATS_DATA = [
  {
    id: 'community1',
    type: 'community',
    name: "Taicang Badminton Club",
    image: require('../../assets/groups/group1.jpg'),
    memberCount: 128,
    lastMessage: {
      sender: "Mike Liu",
      content: "Anyone up for doubles tonight?",
      timestamp: "10:45 AM",
      unread: 3
    }
  },
  {
    id: 'chat1',
    type: 'individual',
    name: "Regina ❤️",
    avatar: require('../../assets/avatars/avatar1.jpg'),
    isOnline: true,
    lastMessage: {
      content: "See you at the courts! 🏸",
      timestamp: "11:30 AM",
      status: "read",
      unread: 0
    }
  },
  {
    id: 'chat2',
    type: 'individual',
    name: "Mike Liu",
    avatar: require('../../assets/avatars/avatarX.jpg'),
    isOnline: true,
    lastMessage: {
      content: "Great game yesterday!",
      timestamp: "Yesterday",
      status: "delivered",
      unread: 1
    }
  },
  {
    id: 'chat3',
    type: 'individual',
    name: "John Lemington",
    avatar: require('../../assets/avatars/avatar4.jpg'),
    isOnline: false,
    lastMessage: {
      content: "Thanks for the tips! When can we practice...",
      timestamp: "Yesterday",
      isSender: false, // Indicates it's a received message
      unread: 2
    }
  },
  {
    id: 'chat4',
    type: 'individual',
    name: "Anderson Goat",
    avatar: require('../../assets/avatars/avatar3.jpg'),
    isOnline: false,
    lastMessage: {
      content: "Let's practice that serve",
      timestamp: "2 days ago",
      status: "read",
      unread: 0
    }
  }
];

// Message status icon component
const MessageStatus = React.memo(({ status }) => {
  const iconName = {
    'sent': 'checkmark',
    'delivered': 'checkmark-done',
    'read': 'checkmark-done'
  }[status];
  
  return (
    <Ionicons 
      name={iconName} 
      size={16} 
      color={status === 'read' ? '#2196F3' : '#999'} 
    />
  );
});

// Chat preview component
const ChatPreview = React.memo(({ chat, onPress }) => {
  const isCommunity = chat.type === 'community';

  return (
    <TouchableOpacity
      style={styles.chatPreview}
      onPress={() => onPress(chat)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={chat.image || chat.avatar} 
          style={[
            styles.avatar,
            isCommunity && styles.communityAvatar
          ]} 
        />
        {!isCommunity && (
          <View style={[
            styles.onlineStatus,
            { backgroundColor: chat.isOnline ? '#4CAF50' : '#757575' }
          ]} />
        )}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>
            {chat.name}
            {isCommunity && (
              <Text style={styles.memberCount}>{' '}• {chat.memberCount} members</Text>
            )}
          </Text>
          <Text style={styles.timestamp}>{chat.lastMessage.timestamp}</Text>
        </View>

        <View style={styles.lastMessage}>
          {isCommunity && (
            <Text style={styles.senderName}>{chat.lastMessage.sender}: </Text>
          )}
          <Text 
            style={[
              styles.messageText,
              chat.lastMessage.unread > 0 && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage.content}
          </Text>
          {!isCommunity && chat.lastMessage.status && (
            <MessageStatus status={chat.lastMessage.status} />
          )}
        </View>
      </View>

      {chat.lastMessage.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{chat.lastMessage.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

export default function Chat() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery) return CHATS_DATA;
    const query = searchQuery.toLowerCase();
    return CHATS_DATA.filter(chat => 
      chat.name.toLowerCase().includes(query) ||
      chat.lastMessage.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleChatPress = useCallback((chat) => {
    router.push({
      pathname: '/chat-detail',
      params: { chatId: chat.id, name: chat.name }
    });
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_GREEN} />
      
      {/* Header */}
      <LinearGradient
        colors={[DARK_GREEN, PRIMARY_GREEN]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}
      >
        <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Stay connected with your sports buddies</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBar,
          isSearchFocused && styles.searchBarFocused
        ]}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chats List */}
      <FlatList
        data={filteredChats}
        renderItem={({ item }) => (
          <ChatPreview 
            chat={item} 
            onPress={handleChatPress}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatsList}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={Platform.OS === 'android'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
    paddingBottom: 24,
  },
  headerContent: {
    position: 'relative',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  headerActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginTop: -30,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchBarFocused: {
    borderColor: PRIMARY_GREEN,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    padding: 4,
  },
  chatsList: {
    padding: 16,
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  communityAvatar: {
    borderRadius: 20,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  unreadMessage: {
    color: DARK_GREEN,
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});