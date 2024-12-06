// app/(tabs)/explore.js

import React, { useState, useCallback } from 'react';
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
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Constants
const SCREEN_WIDTH = Dimensions.get('window').width;
const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const LIGHT_GREEN = '#4caf50';

// Sample Data
const COMMUNITIES_DATA = [
  {
    id: 1,
    name: "Taicang Badminton Club",
    image: require('../../assets/groups/group1.jpg'),
    members: 128,
    activeGames: 3,
    lastActive: "2 hours ago",
    hasNewPosts: true,
  },
  {
    id: 2,
    name: "XJTLU Sports Society",
    image: require('../../assets/groups/group2.jpg'),
    members: 256,
    activeGames: 5,
    lastActive: "5 mins ago",
    hasNewPosts: true,
  },
];

const POSTS_DATA = [
  {
    id: 1,
    authorName: "Regina ❤️",
    authorAvatar: require('../../assets/avatars/avatar1.jpg'),
    timeAgo: "2h ago",
    location: "XJTLU Sports Centre",
    text: "Great badminton session today! Anyone up for another round this weekend? 🏸",
    image: require('../../assets/posts/post1.jpg'),
    activityType: "Badminton Session",
    activityIcon: "badminton",
    likes: 24,
    comments: 8,
    isLiked: false,
    isFriend: true,
  },
  {
    id: 2,
    authorName: "Lebron James",
    authorAvatar: require('../../assets/avatars/avatar2.jpg'),
    timeAgo: "5h ago",
    location: "Taicang Basketball Court",
    text: "Looking for 2 more players for 3v3 basketball tomorrow evening! Intermediate level welcome 🏀",
    activityType: "Basketball Meetup",
    activityIcon: "basketball",
    likes: 15,
    comments: 12,
    isLiked: true,
    isFriend: false,
  },
];

const SUGGESTED_COMMUNITIES = [
  {
    id: 1,
    name: "Weekend Warriors Badminton",
    image: require('../../assets/communities/community1.jpg'),
    members: "128 members",
    skillLevel: "All levels",
    description: "Casual badminton group meeting every weekend",
  },
  {
    id: 2,
    name: "Taicang Tennis Club",
    image: require('../../assets/communities/community2.jpg'),
    members: "256 members",
    skillLevel: "Intermediate",
    description: "Local tennis enthusiasts community",
  },
];

const BUDDIES_DATA = [
  {
    id: 1,
    name: "Anderson Goat",
    avatar: require('../../assets/avatars/avatar3.jpg'),
    primarySport: { name: "Tennis", icon: "tennis" },
    isOnline: true,
    lastActive: "Now",
  },
  {
    id: 2,
    name: "Clarine",
    avatar: require('../../assets/avatars/avatard.jpg'),
    primarySport: { name: "Badminton", icon: "badminton" },
    isOnline: false,
    lastActive: "2h ago",
  },
  {
    id: 3,
    name: "Daniil",
    avatar: require('../../assets/avatars/avatard.jpg'),
    primarySport: { name: "Basketball", icon: "basketball" },
    isOnline: true,
    lastActive: "Now",
  },
  {
    id: 4,
    name: "John Lemington",
    avatar: require('../../assets/avatars/avatar4.jpg'),
    primarySport: { name: "Tennis", icon: "tennis" },
    isOnline: false,
    lastActive: "1d ago",
  },
  {
    id: 5,
    name: "Lin Wang",
    avatar: require('../../assets/avatars/avatard.jpg'),
    primarySport: { name: "Badminton", icon: "badminton" },
    isOnline: true,
    lastActive: "Now",
  },
  {
    id: 6,
    name: "Mackenzie",
    avatar: require('../../assets/avatars/avatard.jpg'),
    primarySport: { name: "Tennis", icon: "tennis" },
    isOnline: false,
    lastActive: "5h ago",
  },
  {
    id: 7,
    name: "Mike Liu",
    avatar: require('../../assets/avatars/avatarX.jpg'),
    primarySport: { name: "Basketball", icon: "basketball" },
    isOnline: true,
    lastActive: "Now",
  },
  {
    id: 8,
    name: "Regina ❤️",
    avatar: require('../../assets/avatars/avatar1.jpg'),
    primarySport: { name: "Badminton", icon: "badminton" },
    isOnline: true,
    lastActive: "Now",
  },
  {
    id: 9,
    name: "Yang Yang",
    avatar: require('../../assets/avatars/avatard.jpg'),
    primarySport: { name: "Tennis", icon: "tennis" },
    isOnline: false,
    lastActive: "3h ago",
  },
].sort((a, b) => a.name.localeCompare(b.name));

// Post Component
const PostCard = React.memo(({ post, onLike, onComment, onConnect }) => (
  <View style={styles.postCard}>
    <View style={styles.postHeader}>
      <View style={styles.postAuthor}>
        <Image source={post.authorAvatar} style={styles.authorAvatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          <Text style={styles.postTime}>{post.timeAgo} • {post.location}</Text>
        </View>
        {!post.isFriend && (
          <TouchableOpacity 
            style={styles.connectUserButton}
            onPress={() => onConnect(post.id)}
          >
            <Ionicons name="person-add" size={16} color="#fff" />
            <Text style={styles.connectUserText}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
      </TouchableOpacity>
    </View>

    <Text style={styles.postText}>{post.text}</Text>
    
    {post.image && (
      <Image source={post.image} style={styles.postImage} />
    )}

    {post.activityType && (
      <View style={styles.activityTag}>
        <MaterialCommunityIcons 
          name={post.activityIcon} 
          size={16} 
          color={PRIMARY_GREEN} 
        />
        <Text style={styles.activityText}>{post.activityType}</Text>
      </View>
    )}

    <View style={styles.postStats}>
      <View style={styles.statItem}>
        <TouchableOpacity 
          style={[styles.statButton, post.isLiked && styles.statButtonActive]}
          onPress={() => onLike(post.id)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={post.isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={post.isLiked ? "#f44336" : "#666"} 
          />
          <Text style={[
            styles.statText, 
            post.isLiked && styles.statTextActive
          ]}>
            {post.likes}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statItem}>
        <TouchableOpacity 
          style={styles.statButton}
          onPress={() => onComment(post.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.statText}>{post.comments}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.shareButton}>
        <Ionicons name="share-outline" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  </View>
));

const CommunityCard = React.memo(({ community }) => (
  <TouchableOpacity style={styles.userCommunityCard}>
    <Image source={community.image} style={styles.userCommunityImage} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      style={styles.userCommunityGradient}
    >
      {community.hasNewPosts && (
        <View style={styles.newPostsBadge}>
          <Text style={styles.newPostsBadgeText}>New Posts</Text>
        </View>
      )}
      <View style={styles.userCommunityContent}>
        <Text style={styles.userCommunityName}>{community.name}</Text>
        <View style={styles.userCommunityStats}>
          <View style={styles.userCommunityStat}>
            <MaterialCommunityIcons name="account-group" size={14} color="#fff" />
            <Text style={styles.userCommunityStatText}>{community.members}</Text>
          </View>
          <View style={styles.userCommunityStat}>
            <MaterialCommunityIcons name="gamepad-variant" size={14} color="#fff" />
            <Text style={styles.userCommunityStatText}>{community.activeGames} active</Text>
          </View>
        </View>
        <View style={styles.lastActiveContainer}>
          <View style={styles.activeIndicator} />
          <Text style={styles.communityLastActiveText}>Active {community.lastActive}</Text>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
));

// Suggested Community Card Component
const SuggestedCommunityCard = React.memo(({ community, onJoin }) => (
  <View style={styles.communitySuggestion}>
    <Image source={community.image} style={styles.communityImage} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      style={styles.communityGradient}
    >
      <View style={styles.communityInfo}>
        <Text style={styles.communityName}>{community.name}</Text>
        <View style={styles.communityStats}>
          <View style={styles.communityStat}>
            <MaterialCommunityIcons name="account-group" size={16} color="#fff" />
            <Text style={styles.communityStatText}>{community.members}</Text>
          </View>
          <View style={styles.communityStat}>
            <MaterialCommunityIcons name="medal" size={16} color="#fff" />
            <Text style={styles.communityStatText}>{community.skillLevel}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => onJoin(community.id)}
        >
          <Text style={styles.joinButtonText}>Join Community</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </View>
));

// Current Buddy Card Component
const CurrentBuddyCard = React.memo(({ buddy, onProfile }) => {
  const router = useRouter();

  const handleMessage = () => {
    router.push('/(tabs)/chat');
  };

  return (
    <TouchableOpacity 
      style={styles.currentBuddyCard}
      onPress={onProfile}
    >
      <View style={styles.buddyAvatarContainer}>
        <Image source={buddy.avatar} style={styles.currentBuddyAvatar} />
        <View style={[
          styles.onlineIndicator,
          { backgroundColor: buddy.isOnline ? '#4CAF50' : '#757575' }
        ]} />
      </View>
      <View style={styles.currentBuddyInfo}>
        <Text style={styles.currentBuddyName}>{buddy.name}</Text>
        <View style={styles.currentBuddyStatus}>
          <MaterialCommunityIcons 
            name={buddy.primarySport.icon} 
            size={14} 
            color="#666" 
          />
          <Text style={styles.buddyLastActiveText}>
            {buddy.isOnline ? 'Online' : buddy.lastActive}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.messageButton}
        onPress={handleMessage}
      >
        <Ionicons name="chatbubble-outline" size={20} color={PRIMARY_GREEN} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default function Explore() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('buddies');
  const [posts, setPosts] = useState(POSTS_DATA); // Added posts state

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  }, []);

  const handleLike = useCallback((postId) => {
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  }, []);

  const handleComment = useCallback((postId) => {
    router.push({
      pathname: '/comments',
      params: { postId }
    });
  }, [router]);

  const handleConnect = useCallback((userId) => {
    // Handle connect with user logic
    console.log('Connect with user:', userId);
    // Implement connection logic here
  }, []);

  const handleJoinCommunity = useCallback((communityId) => {
    // Handle join community logic
    console.log('Join community:', communityId);
    // Implement join logic here
  }, []);

  const handleProfile = useCallback((buddyId) => {
    // Navigate to buddy's profile
    router.push(`/profile/${buddyId}`);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_GREEN} />
      
      {/* Header */}
      <LinearGradient
        colors={[DARK_GREEN, PRIMARY_GREEN]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => router.push('/search')}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'forYou' && styles.activeTab]}
          onPress={() => setActiveTab('forYou')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'forYou' && styles.activeTabText
          ]}>For You</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'communities' && styles.activeTab]}
          onPress={() => setActiveTab('communities')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'communities' && styles.activeTabText
          ]}>Communities</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'buddies' && styles.activeTab]}
          onPress={() => setActiveTab('buddies')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'buddies' && styles.activeTabText
          ]}>Buddies</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_GREEN}
          />
        }
      >
        {activeTab === 'forYou' && (
          <View style={styles.section}>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onConnect={handleConnect}
              />
            ))}
          </View>
        )}

        {activeTab === 'communities' && (
          <View style={styles.section}>
            {/* Your Communities Section */}
            <View style={styles.communitiesHeader}>
              <Text style={styles.sectionTitle}>Your Communities</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push('/community')}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="arrow-forward" size={16} color={PRIMARY_GREEN} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.userCommunitiesList}
            >
              {COMMUNITIES_DATA.map(community => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </ScrollView>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Suggested Communities
            </Text>
            {SUGGESTED_COMMUNITIES.map(community => (
              <SuggestedCommunityCard
                key={community.id}
                community={community}
                onJoin={handleJoinCommunity}
              />
            ))}
          </View>
        )}

        {activeTab === 'buddies' && (
          <View style={styles.section}>
            <View style={styles.buddiesHeader}>
              <Text style={styles.sectionTitle}>Your Buddies</Text>
              <TouchableOpacity 
                style={styles.findMoreButton}
                onPress={() => router.push('/buddies')}
              >
                <Text style={styles.findMoreText}>Find More</Text>
                <Ionicons name="arrow-forward" size={16} color={PRIMARY_GREEN} />
              </TouchableOpacity>
            </View>

            <View style={styles.currentBuddiesList}>
              {BUDDIES_DATA.map(buddy => (
                <CurrentBuddyCard
                  key={buddy.id}
                  buddy={buddy}
                  onProfile={() => handleProfile(buddy.id)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_GREEN,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: PRIMARY_GREEN,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  communitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK_GREEN,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: PRIMARY_GREEN,
    fontWeight: '600',
  },
  userCommunitiesList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  userCommunityCard: {
    width: 240,
    height: 160,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
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
  userCommunityImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  userCommunityGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  userCommunityContent: {
    padding: 12,
  },
  userCommunityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userCommunityStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  userCommunityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userCommunityStatText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  lastActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  communityLastActiveText: {
    fontSize: 12,
    color: '#FFFFFFD9',
    fontWeight: '500',
  },
  buddyLastActiveText: {
    fontSize: 12,
    color: '#666',
  },
  newPostsBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: PRIMARY_GREEN,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  newPostsBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  communitySuggestion: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
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
  communityImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  communityGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  communityInfo: {
    gap: 8,
  },
  communityName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  communityStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  communityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  communityStatText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  joinButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    color: PRIMARY_GREEN,
    fontWeight: '600',
  },
  buddiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  findMoreButton: { // New Style
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  findMoreText: { // New Style
    color: PRIMARY_GREEN,
    fontSize: 14,
    fontWeight: '600',
  },
  currentBuddiesList: {
    gap: 12,
  },
  currentBuddyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
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
    marginBottom: 12, // Added margin for spacing between buddies
  },
  buddyAvatarContainer: {
    position: 'relative',
  },
  currentBuddyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  currentBuddyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currentBuddyName: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 4,
  },
  currentBuddyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Post Styles
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  connectUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  connectUserText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
  },
  postText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  activityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  activityText: {
    fontSize: 12,
    color: PRIMARY_GREEN,
    fontWeight: '500',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    marginRight: 24,
  },
  statButton: { // New Style
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  statButtonActive: { // New Style
    backgroundColor: '#ffebee',
  },
  statText: { // Updated Style
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statTextActive: { // New Style
    color: '#f44336',
  },
  shareButton: {
    marginLeft: 'auto',
  },
});
