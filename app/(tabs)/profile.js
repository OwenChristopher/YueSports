// app/profile.js
import React, { useState, useRef, useCallback, useMemo } from 'react';
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
  Animated,
  Dimensions,
  Modal
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import ProfileStatistics from '../../components/ProfileStatistics'; // Importing the component

const SCREEN_WIDTH = Dimensions.get('window').width;
const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Mock user data
const USER_DATA = {
  id: '7',
  name: "Owen Christopher Tjahyadi",
  avatar: require('../../assets/avatars/avatar_main.jpg'),
  bio: "Passionate about sports and always looking to improve! 🏸",
  location: "Taicang, China",
  joinDate: "Joined March 2024",
  isPremium: false,
  titles: ["Weekend Warrior", "Rising Star", "Badminton Teacher", "GOAT-ed Full Stack Dev"],
  sports: [
    {
      name: "Badminton",
      level: "Intermediate",
      rating: 1287,
      matchesPlayed: 45,
      winRate: "65%",
      titles: ["Weekend Warrior", "Rising Star"],
      achievements: ["WINSTREAK", "VETERAN"],
      recentForm: ["W", "L", "W", "L", "W"]
    },
    {
      name: "Tennis",
      level: "Beginner",
      rating: 856,
      matchesPlayed: 12,
      winRate: "42%",
      titles: ["Rookie"],
      achievements: ["RISING_STAR"],
      recentForm: ["L", "L", "W", "L", "W"]
    }
  ],
  statistics: {
    totalMatches: 57,
    totalWins: 34,
    totalHours: 128,
    longestStreak: 6,
    averageRating: 1071,
    sportingSpirit: 4.8,
    achievements: 12,
    tournaments: 5
  },
  recentActivities: [
    {
      id: 1,
      type: 'match',
      sport: 'Badminton',
      opponent: "Mike Liu",
      result: "Won 21-18, 21-15",
      location: "XJTLU Sports Centre",
      time: "Yesterday, 18:00"
    },
    {
      id: 2,
      type: 'tournament',
      sport: 'Badminton',
      name: "Weekend Warriors Tournament",
      result: "Quarter-finalist",
      location: "Taicang Sports Complex",
      time: "2 days ago"
    }
  ]
};

const ACHIEVEMENTS = {
  WINSTREAK: {
    icon: 'fire',
    color: '#FF9800',
    label: 'Win Streak'
  },
  CHAMPION: {
    icon: 'crown',
    color: '#FFC107',
    label: 'Champion'
  },
  VETERAN: {
    icon: 'shield',
    color: '#9C27B0',
    label: 'Veteran'
  },
  RISING_STAR: {
    icon: 'trending-up',
    color: '#2196F3',
    label: 'Rising Star'
  }
};

const PremiumModal = React.memo(({ visible, onClose, onUpgrade }) => {
  const benefits = [
    {
      icon: 'chart-box',
      title: 'Detailed Statistics',
      description: 'Access comprehensive performance analytics'
    },
    {
      icon: 'history',
      title: 'Historical Data',
      description: 'Track your progress over time'
    },
    {
      icon: 'trending-up',
      title: 'Advanced Metrics',
      description: 'Get insights into your gameplay patterns'
    },
    {
      icon: 'trophy',
      title: 'Achievement System',
      description: 'Unlock exclusive badges and rewards'
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={[DARK_GREEN, PRIMARY_GREEN]}
            style={styles.modalHeader}
          >
            <MaterialCommunityIcons name="crown" size={40} color="#FFD700" />
            <Text style={styles.modalTitle}>Unlock Premium Features</Text>
            <Text style={styles.modalSubtitle}>
              Get detailed insights into your performance
            </Text>
          </LinearGradient>

          <ScrollView style={styles.benefitsList}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <MaterialCommunityIcons
                    name={benefit.icon}
                    size={24}
                    color={PRIMARY_GREEN}
                  />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>
                    {benefit.description}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
              <LinearGradient
                colors={[PRIMARY_GREEN, DARK_GREEN]}
                style={styles.upgradeButtonGradient}
              >
                <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                <Text style={styles.priceText}>¥29.99/month</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
});

const SportCard = React.memo(({ sport, canViewDetailedStats, onStatPress }) => {
  return (
    <View style={styles.sportCard}>
      <LinearGradient
        colors={[PRIMARY_GREEN, DARK_GREEN]}
        style={styles.sportCardGradient}
      >
        <View style={styles.sportHeader}>
          <View style={styles.sportTitleContainer}>
            <MaterialCommunityIcons 
              name={sport.name.toLowerCase()} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.sportName}>{sport.name}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{sport.level}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={styles.statValue}>{sport.rating}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Win Rate</Text>
            <Text style={styles.statValue}>{sport.winRate}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Matches</Text>
            <Text style={styles.statValue}>{sport.matchesPlayed}</Text>
          </View>
        </View>

        <View style={styles.recentForm}>
          {sport.recentForm.map((result, index) => (
            <View 
              key={index} 
              style={[
                styles.formIndicator,
                { backgroundColor: result === 'W' ? '#4CAF50' : '#f44336' }
              ]}
            >
              <Text style={styles.formText}>{result}</Text>
            </View>
          ))}
        </View>

        {sport.achievements && (
          <View style={styles.achievements}>
            {sport.achievements.map((achievement, index) => (
              <View 
                key={index}
                style={[
                  styles.achievementBadge, 
                  { backgroundColor: `${ACHIEVEMENTS[achievement].color}20` }
                ]}
              >
                <MaterialCommunityIcons 
                  name={ACHIEVEMENTS[achievement].icon} 
                  size={16} 
                  color={ACHIEVEMENTS[achievement].color} 
                />
                <Text style={[styles.achievementText, { color: ACHIEVEMENTS[achievement].color }]}>
                  {ACHIEVEMENTS[achievement].label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {!canViewDetailedStats && (
          <TouchableOpacity 
            style={styles.unlockButton}
            onPress={() => onStatPress('unlock')}
          >
            <MaterialCommunityIcons name="lock" size={20} color={PRIMARY_GREEN} />
            <Text style={styles.unlockButtonText}>
              Unlock Detailed Statistics
            </Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
});

const ProfileBorder = React.memo(({ children }) => (
  <LinearGradient
    colors={['#FFD700', PRIMARY_GREEN, '#4169E1']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.profileBorder}
  >
    <View style={styles.profileBorderInner}>
      {children}
    </View>
  </LinearGradient>
));

const TitleBadge = React.memo(({ title, icon, gradient }) => (
  <LinearGradient
    colors={gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.titleBadge}
  >
    <MaterialCommunityIcons name={icon} size={16} color="#fff" />
    <Text style={styles.titleBadgeText}>{title}</Text>
  </LinearGradient>
));

const TitleChip = React.memo(({ title }) => (
  <View style={styles.titleChip}>
    <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
    <Text style={styles.titleChipText}>{title}</Text>
  </View>
));

export default function Profile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  
  const user = USER_DATA; 
  const isCurrentUser = params.id === USER_DATA.id;
  const canViewDetailedStats = useMemo(() => 
    isCurrentUser || user.isPremium, [isCurrentUser, user.isPremium]
  );

  const handleUpgrade = useCallback(() => {
    setShowPremiumModal(false);
    router.push('/subscription');
  }, [router]);

  const handleStatPress = useCallback((stat) => {
    if (!canViewDetailedStats) {
      setShowPremiumModal(true);
      return;
    }
    setSelectedStat(stat);
  }, [canViewDetailedStats]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [2, 1],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp'
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_GREEN} />

      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[DARK_GREEN, PRIMARY_GREEN]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerNav}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <BlurView intensity={30} style={styles.backButtonBlur}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            {isCurrentUser && (
              <TouchableOpacity style={styles.settingsButton}>
                <BlurView intensity={30} style={styles.settingsButtonBlur}>
                  <Ionicons name="settings-outline" size={24} color="#fff" />
                </BlurView>
              </TouchableOpacity>
            )}
          </View>

          <Animated.View 
            style={[styles.profileHeader, { opacity: headerOpacity }]}
          >
            <ProfileBorder>
              <Animated.Image
                source={user.avatar}
                style={[styles.profileAvatar, { transform: [{ scale: imageScale }] }]}
              />
            </ProfileBorder>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              
              {/* Equipped Titles Badges */}
              <View style={styles.titleBadges}>
                <TitleBadge
                  title="Badminton Teacher"
                  icon="badminton"
                  gradient={['#FF6B6B', '#EE5253']}
                />
                <TitleBadge
                  title="GOAT-ed Full Stack Dev"
                  icon="code-braces"
                  gradient={['#4834D4', '#686DE0']}
                />
              </View>

              <Text style={styles.profileBio}>{user.bio}</Text>
              
              <View style={styles.profileMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={16} color="#fff" />
                  <Text style={styles.metaText}>{user.location}</Text>
                </View>
                <Text style={styles.joinDate}>{user.joinDate}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick Stats Bar */}
          <Animated.View 
            style={[styles.quickStats, { opacity: headerOpacity }]}
          >
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>
                {user.statistics.totalMatches}
              </Text>
              <Text style={styles.quickStatLabel}>Matches</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>
                {user.statistics.achievements}
              </Text>
              <Text style={styles.quickStatLabel}>Achievements</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>
                {user.statistics.tournaments}
              </Text>
              <Text style={styles.quickStatLabel}>Tournaments</Text>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Titles Section */}
        {user.titles && user.titles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Titles</Text>
            <View style={styles.titlesRow}>
              {user.titles.map((title, index) => (
                <TitleChip key={index} title={title} />
              ))}
            </View>
          </View>
        )}

        {/* Sports Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Sports</Text>
          {user.sports.map((sport, index) => (
            <SportCard 
              key={index} 
              sport={sport}
              canViewDetailedStats={canViewDetailedStats}
              onStatPress={handleStatPress}
            />
          ))}
        </View>

        {/* Statistics Section (Integrated ProfileStatistics) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            {!canViewDetailedStats && (
              <TouchableOpacity 
                style={styles.premiumBadge}
                onPress={() => setShowPremiumModal(true)}
              >
                <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </TouchableOpacity>
            )}
          </View>
          <ProfileStatistics 
            statistics={user.statistics}
            canViewDetailedStats={canViewDetailedStats}
            onUnlockPress={() => setShowPremiumModal(true)}
          />
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          {user.recentActivities.map((activity, index) => (
            <View key={index} style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <MaterialCommunityIcons 
                  name={activity.type === 'match' ? activity.sport.toLowerCase() : 'trophy'} 
                  size={24} 
                  color={PRIMARY_GREEN} 
                />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>
                  {activity.type === 'match' ? `vs ${activity.opponent}` : activity.name}
                </Text>
                <Text style={styles.activityResult}>{activity.result}</Text>
                <View style={styles.activityMeta}>
                  <Text style={styles.activityLocation}>{activity.location}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <PremiumModal 
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgrade}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: DARK_GREEN,
    overflow: 'hidden',
    zIndex: 1,
  },
  headerGradient: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingsButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
  },
  profileBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBorderInner: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
    backgroundColor: '#fff',
    padding: 2,
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  titleBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  titleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileBio: {
    fontSize: 14,
    color: '#dcdcdc',
    marginBottom: 10,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  joinDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    marginTop: 16,
    padding: 16,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  quickStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  quickStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
    paddingTop: HEADER_MAX_HEIGHT - 32,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
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
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumBadgeText: {
    color: '#f57c00',
    fontSize: 12,
    fontWeight: '600',
  },
  sportCard: {
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
  sportCardGradient: {
    padding: 16,
  },
  sportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sportName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  recentForm: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  formIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  achievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '500',
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e8f5e9',
    paddingVertical: 12,
    borderRadius: 12,
  },
  unlockButtonText: {
    color: PRIMARY_GREEN,
    fontSize: 14,
    fontWeight: '500',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 4,
  },
  activityResult: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLocation: {
    fontSize: 12,
    color: '#666',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: DARK_GREEN,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  benefitsList: {
    padding: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  upgradeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  priceText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  titlesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  titleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderColor: '#ffe0b2',
    borderWidth: 1,
  },
  titleChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_GREEN,
  },
});
