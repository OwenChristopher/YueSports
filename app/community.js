// app/community.js
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
  RefreshControl,
  Animated
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const LIGHT_GREEN = '#4caf50';

// Memoized AnnouncementCard component
const AnnouncementCard = React.memo(({ announcement }) => (
  <View style={[styles.announcementCard, { marginRight: 16 }]}>
    <LinearGradient
      colors={[PRIMARY_GREEN, DARK_GREEN]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.announcementGradient}
    >
      <View style={styles.announcementHeader}>
        <MaterialCommunityIcons 
          name={announcement.icon} 
          size={24} 
          color="#fff" 
        />
        <Text style={styles.announcementTitle}>{announcement.title}</Text>
        {announcement.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>
      <Text style={styles.announcementText}>{announcement.message}</Text>
      <View style={styles.announcementFooter}>
        <Text style={styles.announcementTime}>{announcement.time}</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </View>
));

// Memoized FriendCard component
const FriendCard = React.memo(({ friend, onChat }) => (
  <View style={styles.friendCard}>
    <View style={styles.friendInfo}>
      <Image source={friend.avatar} style={styles.avatar} />
      <View style={styles.friendDetails}>
        <Text style={styles.friendName}>{friend.name}</Text>
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusDot, 
              { backgroundColor: friend.isOnline ? '#4CAF50' : '#757575' }
            ]} 
          />
          <Text style={styles.statusText}>
            {friend.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>
      {friend.isPlaying && (
        <View style={styles.playingBadge}>
          <MaterialCommunityIcons 
            name="badminton" 
            size={16} 
            color={PRIMARY_GREEN} 
          />
          <Text style={styles.playingText}>Playing now</Text>
        </View>
      )}
    </View>
    <View style={styles.friendActions}>
      <TouchableOpacity 
        style={styles.iconButton}
        onPress={() => onChat(friend)}
      >
        <Ionicons name="chatbubble-outline" size={20} color={PRIMARY_GREEN} />
      </TouchableOpacity>
    </View>
  </View>
));

// Memoized GroupCard component
const GroupCard = React.memo(({ group }) => (
  <TouchableOpacity style={styles.groupCard}>
    <Image source={group.image} style={styles.groupImage} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      style={styles.groupGradient}
    >
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{group.name}</Text>
        <View style={styles.groupStats}>
          <View style={styles.groupStat}>
            <MaterialCommunityIcons 
              name="account-group" 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.groupStatText}>{group.members} members</Text>
          </View>
          <View style={styles.groupStat}>
            <MaterialCommunityIcons 
              name="tennis" 
              size={16} 
              color="#fff" 
            />
            <Text style={styles.groupStatText}>{group.activeGames} active</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
));

export default function Community() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Memoized data
  const announcements = useMemo(() => [
    {
      id: 1,
      title: "Game Invite",
      message: "John invited you to join Badminton doubles at XJTLU Sports Centre",
      time: "10 mins ago",
      icon: "badminton",
      isNew: true
    },
    {
      id: 2,
      title: "Tournament Alert",
      message: "Weekend Warriors Tournament registration closing soon!",
      time: "1 hour ago",
      icon: "trophy",
      isNew: true
    }
  ], []);

  const friends = useMemo(() => [
    {
      id: 1,
      name: "Regina ❤️",
      avatar: require('../assets/avatars/avatar1.jpg'),
      isOnline: true,
      isPlaying: true,
      lastActive: "Now"
    },
    {
      id: 2,
      name: "Mike Liu",
      avatar: require('../assets/avatars/avatarX.jpg'),
      isOnline: true,
      isPlaying: false,
      lastActive: "Now"
    }
  ], []);

  const groups = useMemo(() => [
    {
      id: 1,
      name: "Taicang Badminton Club",
      image: require('../assets/groups/group1.jpg'),
      members: 128,
      activeGames: 3
    },
    {
      id: 2,
      name: "XJTLU Sports Society",
      image: require('../assets/groups/group2.jpg'),
      members: 256,
      activeGames: 5
    }
  ], []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  }, []);

  const handleChatPress = useCallback((friend) => {
    router.push({
      pathname: '/(tabs)/chat',
      params: { userId: friend.id }
    });
  }, [router]);

  const [showActions, setShowActions] = useState(false);
  const actionButtonAnim = useRef(new Animated.Value(0)).current;

  const toggleActions = useCallback(() => {
    const toValue = showActions ? 0 : 1;
    setShowActions(!showActions);
    Animated.spring(actionButtonAnim, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true
    }).start();
  }, [showActions, actionButtonAnim]);

  // Handle create group, add friend, or join group
  const handleAction = useCallback((type) => {
    toggleActions();
    if (type === 'group') {
      router.push('/create-group');
    } else if (type === 'friend') {
      router.push('/add-friend');
    } else if (type === 'joinGroup') {
      router.push('/join-group');
    }
  }, [router, toggleActions]);

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
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/(tabs)/chat')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

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
        {/* Announcements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.announcementsContainer}
          >
            {announcements.map(announcement => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))}
          </ScrollView>
        </View>

        {/* Friends Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Friends</Text>
            <Link href="/(tabs)/explore?tab=buddies" asChild>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="arrow-forward" size={20} color={PRIMARY_GREEN} />
              </TouchableOpacity>
            </Link>
          </View>
          <View style={styles.friendsList}>
            {friends.map(friend => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onChat={handleChatPress}
              />
            ))}
          </View>
        </View>

        {/* Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Groups</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="arrow-forward" size={20} color={PRIMARY_GREEN} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.groupsContainer}
          >
            {groups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [{
              rotate: actionButtonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '45deg']
              })
            }]
          }
        ]}
      >
        <TouchableOpacity onPress={toggleActions}>
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Action Menu */}
      {showActions && (
        <View style={styles.actionMenu}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => handleAction('group')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="people" size={24} color={PRIMARY_GREEN} />
            </View>
            <Text style={styles.actionText}>Create Group</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => handleAction('joinGroup')}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="account-group" size={24} color={PRIMARY_GREEN} />
            </View>
            <Text style={styles.actionText}>Join Group</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => handleAction('friend')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="person-add" size={24} color={PRIMARY_GREEN} />
            </View>
            <Text style={styles.actionText}>Add Friend</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

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
  headerButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f44336',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 24, // Add bottom margin to create space between sections
  },
  sectionHeader: {
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
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    color: PRIMARY_GREEN,
    fontWeight: '600',
  },
  announcementsContainer: {
    paddingRight: 16,
    paddingVertical: 8,
    columnGap: 3, 
    // marginBottom: 16,
  },
  announcementCard: {
    width: 300,
    borderRadius: 16,
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
  announcementGradient: {
    padding: 16,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  announcementTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  newBadge: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  announcementText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 12,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  friendsList: {
    gap: 12,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
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
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  playingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: -16, // Increased negative margin to move further left
    marginRight: 12, // Added right margin for spacing from chat button
  },
  playingText: {
    fontSize: 12,
    color: PRIMARY_GREEN,
    fontWeight: '500',
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupsContainer: {
    paddingRight: 16,
    gap: 16,
  },
  groupCard: {
    width: 280,
    height: 160,
    borderRadius: 16,
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
  groupImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  groupGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  groupInfo: {
    gap: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  groupStats: {
    flexDirection: 'row',
    gap: 12,
  },
  groupStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupStatText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  actionMenu: {
    position: 'absolute',
    right: 24,
    bottom: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: DARK_GREEN,
    fontWeight: '500',
  },
});