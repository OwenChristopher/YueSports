// app/leaderboard.js

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
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
  RefreshControl
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';

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

const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium'
};

const PREMIUM_FEATURES = {
  detailed_stats: {
    required: SUBSCRIPTION_TIERS.PREMIUM,
    name: 'Detailed Statistics',
    description: 'Access in-depth performance analytics'
  },
  historical_data: {
    required: SUBSCRIPTION_TIERS.PREMIUM,
    name: 'Historical Data',
    description: 'View past seasons and progression'
  },
  friend_comparison: {
    required: SUBSCRIPTION_TIERS.PREMIUM,
    name: 'Friend Comparisons',
    description: 'Compare detailed stats with friends'
  },
  achievements: {
    required: SUBSCRIPTION_TIERS.PREMIUM,
    name: 'Achievement System',
    description: 'Unlock badges and track milestones'
  }
};

const RANKING_CATEGORIES = {
  GLOBAL: 'global',
  LOCAL: 'local',
  ACHIEVEMENT: 'achievement',
  STREAK: 'streak'
};

const CURRENT_SEASON = {
  id: 3,
  name: "Spring 2024",
  startDate: "2024-03-01",
  endDate: "2024-05-31",
  rewards: {
    diamond: {
      title: "Diamond Champion",
      rewards: ["Limited Edition Profile Frame", "Diamond Trophy", "1000 Premium Points"]
    },
    platinum: {
      title: "Platinum Elite",
      rewards: ["Platinum Trophy", "500 Premium Points"]
    },
    gold: {
      title: "Gold Master",
      rewards: ["Gold Trophy", "250 Premium Points"]
    },
    silver: {
      title: "Silver Star",
      rewards: ["Silver Trophy", "100 Premium Points"]
    },
    bronze: {
      title: "Bronze Novice",
      rewards: ["Bronze Trophy", "50 Premium Points"]
    }
  }
};

const MOCK_RANKINGS = {
  badminton: [
    {
      id: '1',
      name: "Regina Chen",
      avatar: require('../assets/avatars/avatar1.jpg'),
      rank: 1,
      points: 2850,
      wins: 42,
      losses: 8,
      winStreak: 5,
      tier: "diamond",
      recentMatches: ["W", "W", "W", "L", "W"],
      change: "up",
      achievements: ["WINSTREAK", "CHAMPION"],
      nextTier: {
        name: "Master",
        pointsNeeded: 150
      }
    },
    {
      id: '2',
      name: "Mike Liu",
      avatar: require('../assets/avatars/avatar2.jpg'),
      rank: 2,
      points: 2720,
      wins: 38,
      losses: 12,
      winStreak: 3,
      tier: "platinum",
      recentMatches: ["W", "W", "W", "W", "L"],
      change: "same"
    },
    {
      id: '3',
      name: "Sara Gomez",
      avatar: require('../assets/avatars/avatar3.jpg'),
      rank: 3,
      points: 2600,
      wins: 35,
      losses: 15,
      winStreak: 4,
      tier: "platinum",
      recentMatches: ["W", "L", "W", "W", "W"],
      change: "down"
    },
    {
      id: '4',
      name: "Liam O'Connor",
      avatar: require('../assets/avatars/avatar4.jpg'),
      rank: 4,
      points: 2450,
      wins: 30,
      losses: 20,
      winStreak: 2,
      tier: "gold",
      recentMatches: ["L", "W", "W", "L", "W"],
      change: "up"
    },
    {
      id: '5',
      name: "Aisha Patel",
      avatar: require('../assets/avatars/avatar5.jpg'),
      rank: 5,
      points: 2300,
      wins: 28,
      losses: 22,
      winStreak: 1,
      tier: "gold",
      recentMatches: ["W", "W", "L", "W", "L"],
      change: "same"
    },
    {
      id: '6',
      name: "Carlos Mendes",
      avatar: require('../assets/avatars/avatar6.jpg'),
      rank: 6,
      points: 2200,
      wins: 25,
      losses: 25,
      winStreak: 3,
      tier: "silver",
      recentMatches: ["L", "L", "W", "W", "L"],
      change: "down"
    },
    {
      id: '7',
      name: "Owen Christopher Tjahyadi",
      avatar: require('../assets/avatars/avatard.jpg'),
      rank: 108,
      points: 1287,
      wins: 15,
      losses: 30,
      winStreak: 2,
      tier: "bronze",
      recentMatches: ["W", "L", "W", "L", "W"],
      change: "up",
      achievements: ["VETERAN"],
      nextTier: {
        name: "Silver",
        pointsNeeded: 513
      }
    }
  ],
  tennis: [],
  basketball: []
};

const TIERS = {
  diamond: {
    name: "Diamond",
    color: "#3F51B5",
    minPoints: 2500
  },
  platinum: {
    name: "Platinum",
    color: "#9C27B0",
    minPoints: 2000
  },
  gold: {
    name: "Gold",
    color: "#FFC107",
    minPoints: 1500
  },
  silver: {
    name: "Silver",
    color: "#9E9E9E",
    minPoints: 1000
  },
  bronze: {
    name: "Bronze",
    color: "#795548",
    minPoints: 500
  }
};

const RankBadge = React.memo(({ rank, change }) => (
  <View style={styles.rankBadge}>
    <Text style={styles.rankNumber}>#{rank}</Text>
    {change === "up" && (
      <MaterialCommunityIcons name="arrow-up" size={16} color="#4CAF50" />
    )}
    {change === "down" && (
      <MaterialCommunityIcons name="arrow-down" size={16} color="#F44336" />
    )}
  </View>
));

const TierBadge = React.memo(({ tier }) => (
  <View style={[styles.tierBadge, { backgroundColor: `${TIERS[tier].color}20` }]}>
    <Text style={[styles.tierText, { color: TIERS[tier].color }]}>
      {TIERS[tier].name}
    </Text>
  </View>
));

const RecentMatches = React.memo(({ matches }) => (
  <View style={styles.recentMatches}>
    {matches.map((match, index) => (
      <View
        key={index}
        style={[
          styles.matchResult,
          { backgroundColor: match === "W" ? "#E8F5E9" : "#FFEBEE" }
        ]}
      >
        <Text
          style={[
            styles.matchResultText,
            { color: match === "W" ? PRIMARY_GREEN : "#F44336" }
          ]}
        >
          {match}
        </Text>
      </View>
    ))}
  </View>
));

const AchievementBadge = React.memo(({ type }) => {
  const achievement = ACHIEVEMENTS[type];
  if (!achievement) return null;
  return (
    <View style={[styles.achievementBadge, { backgroundColor: `${achievement.color}20` }]}>
      <MaterialCommunityIcons name={achievement.icon} size={16} color={achievement.color} />
    </View>
  );
});

const ProgressBar = React.memo(({ current, max, label }) => {
  const progress = (current / max) * 100;
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{label}</Text>
    </View>
  );
});

// New TopThreePlayers component
const TopThreePlayers = React.memo(({ players, onPress }) => {
  const [first, second, third] = players;

  return (
    <View style={styles.topThreeContainer}>
      {/* Second Place */}
      <View style={[styles.topPlayerWrapper]}>
        <View style={styles.crownContainer}>
          <MaterialCommunityIcons name="medal" size={24} color="#C0C0C0" />
        </View>
        <Image source={second.avatar} style={styles.runnerUpAvatar} />
        <Text style={styles.runnerUpName} numberOfLines={1}>
          {second.name}
        </Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{second.points}</Text>
          <Text style={styles.ptsLabel}>Pts</Text>
        </View>
      </View>

      {/* First Place */}
      <View style={[styles.topPlayerWrapper, styles.firstPlace]}>
        <View style={styles.crownContainer}>
          <MaterialCommunityIcons name="crown" size={32} color="#FFD700" />
        </View>
        <Image source={first.avatar} style={styles.winnerAvatar} />
        <Text style={styles.winnerName} numberOfLines={1}>
          {first.name}
        </Text>
        <View style={[styles.pointsBadge, styles.winnerPoints]}>
          <Text style={[styles.pointsText, styles.winnerPointsText]}>{first.points}</Text>
          <Text style={[styles.ptsLabel, styles.winnerPtsLabel]}>Pts</Text>
        </View>
      </View>

      {/* Third Place */}
      <View style={[styles.topPlayerWrapper]}>
        <View style={styles.crownContainer}>
          <MaterialCommunityIcons name="medal" size={24} color="#CD7F32" />
        </View>
        <Image source={third.avatar} style={styles.runnerUpAvatar} />
        <Text style={styles.runnerUpName} numberOfLines={1}>
          {third.name}
        </Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{third.points}</Text>
          <Text style={styles.ptsLabel}>Pts</Text>
        </View>
      </View>
    </View>
  );
});

// Define SeasonProgress only once
const SeasonProgress = ({ season, userTier }) => {
  const endDate = new Date(season.endDate);
  const currentDate = new Date();
  const timeRemaining = Math.max(0, Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)));

  const rewards = season.rewards[userTier] || {};

  return (
    <View style={styles.seasonContainer}>
      <LinearGradient
        colors={[DARK_GREEN, PRIMARY_GREEN]}
        style={styles.seasonGradient}
      >
        <View style={styles.seasonHeader}>
          <Text style={styles.seasonName}>{season.name}</Text>
          <Text style={styles.seasonTimeRemaining}>{timeRemaining} days left</Text>
        </View>
        <View style={styles.seasonRewards}>
          <Text style={styles.seasonTierReward}>{rewards.title}</Text>
          <View style={styles.rewardsList}>
            {rewards.rewards && rewards.rewards.map((reward, index) => (
              <View key={index} style={styles.rewardItem}>
                <MaterialCommunityIcons name="check-circle-outline" size={16} color={PRIMARY_GREEN} />
                <Text style={styles.rewardText}>{reward}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const PlayerCardComponent = React.memo(({ player, rank, canViewDetails, onPress }) => {
  const isUser = player.id === '7'; // Assuming '7' is the user's ID

  return (
    <TouchableOpacity 
      style={[
        styles.playerCard, 
        isUser && styles.userPlayerCard
      ]} 
      onPress={() => onPress(player)}
      activeOpacity={0.7}
    >
      <View style={styles.playerRankSection}>
        <RankBadge rank={rank} change={player.change} />
        <Image source={player.avatar} style={styles.playerAvatar} />
      </View>

      <View style={styles.playerInfo}>
        <View style={styles.playerNameContainer}>
          {isUser && <Text style={styles.youLabel}>You</Text>}
          <Text style={styles.playerName}>{player.name}</Text>
        </View>
        <View style={styles.playerStats}>
          <TierBadge tier={player.tier} />
          <Text style={styles.pointsText}>{player.points} pts</Text>
        </View>
      </View>

      <View style={styles.performanceStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{player.wins}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{player.losses}</Text>
          <Text style={styles.statLabel}>Losses</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{player.winStreak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      <RecentMatches matches={player.recentMatches} />

      {canViewDetails ? (
        <>
          {player.achievements && player.achievements.length > 0 && (
            <View style={styles.achievementBadges}>
              {player.achievements.map((achievement, index) => (
                <AchievementBadge key={index} type={achievement} />
              ))}
            </View>
          )}

          {player.nextTier && (
            <ProgressBar
              current={player.points}
              max={player.points + player.nextTier.pointsNeeded}
              label={`${player.nextTier.pointsNeeded} points to ${player.nextTier.name}`}
            />
          )}
        </>
      ) : (
        <View style={styles.premiumIndicator}>
          <MaterialCommunityIcons name="lock" size={16} color={PRIMARY_GREEN} />
          <Text style={styles.premiumIndicatorText}>
            Upgrade to Premium to view detailed stats
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const SportTab = React.memo(({ sport, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.sportTab, isActive && styles.sportTabActive]}
    onPress={() => onPress(sport)}
  >
    <MaterialCommunityIcons
      name={sport.toLowerCase()}
      size={24}
      color={isActive ? '#fff' : '#666'}
    />
    <Text style={[styles.sportTabText, isActive && styles.sportTabTextActive]}>
      {sport.charAt(0).toUpperCase() + sport.slice(1)}
    </Text>
  </TouchableOpacity>
));

const CategorySelector = ({ category, onSelect }) => {
  const categories = Object.keys(RANKING_CATEGORIES);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categorySelector}
      contentContainerStyle={styles.categoryFilterContent}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[
            styles.categoryButton,
            category === cat && styles.categoryButtonActive
          ]}
          onPress={() => onSelect(cat)}
        >
          <Text
            style={[
              styles.categoryButtonText,
              category === cat && styles.categoryButtonTextActive
            ]}
          >
            {RANKING_CATEGORIES[cat].charAt(0).toUpperCase() + RANKING_CATEGORIES[cat].slice(1)}
          </Text>
          {category === cat && (
            <MaterialCommunityIcons name="check" size={16} color="#fff" style={styles.premiumIcon} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default function Leaderboard() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState('badminton');
  const [selectedCategory, setSelectedCategory] = useState(RANKING_CATEGORIES.GLOBAL);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [userSubscription, setUserSubscription] = useState(SUBSCRIPTION_TIERS.FREE);
  const scrollY = useRef(new Animated.Value(0)).current;

  const currentUserId = '7'; // User's ID

  const canViewDetailedStats = useCallback((playerId) => {
    const isSelf = playerId === currentUserId;
    return isSelf || userSubscription === SUBSCRIPTION_TIERS.PREMIUM;
  }, [userSubscription, currentUserId]);

  const handlePlayerPress = useCallback((player) => {
    if (!canViewDetailedStats(player.id)) {
      setShowUpgradeModal(true);
      return;
    }
    
    router.push({
      pathname: '/profile/[id]',
      params: { id: player.id }
    });
  }, [canViewDetailedStats, router]);

  const handleTopThreePress = useCallback((player) => {
    setShowUpgradeModal(true);
  }, []);

  const handleUpgrade = useCallback(() => {
    setShowUpgradeModal(false);
    router.push('/subscription');
  }, [router]);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleInfoPress = useCallback(() => {
    setShowRewardsModal(true);
  }, []);

  const canAccessFeature = useCallback((featureKey) => {
    const feature = PREMIUM_FEATURES[featureKey];
    if (!feature) return false;
    return userSubscription === SUBSCRIPTION_TIERS.PREMIUM;
  }, [userSubscription]);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [Platform.OS === 'ios' ? 180 : 200, Platform.OS === 'ios' ? 120 : 140],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.98],
    extrapolate: 'clamp'
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  }, []);

  const filteredRankings = useMemo(() => {
    return MOCK_RANKINGS[selectedSport] || [];
  }, [selectedSport]);

  const topThreePlayers = useMemo(() => {
    return filteredRankings.slice(0, 3);
  }, [filteredRankings]);

  const otherPlayers = useMemo(() => {
    return filteredRankings.slice(3);
  }, [filteredRankings]);

  const renderPremiumModal = () => {
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
        icon: 'account-group',
        title: 'Friend Comparisons',
        description: 'Compare stats with friends'
      },
      {
        icon: 'trophy',
        title: 'Achievement System',
        description: 'Unlock exclusive badges and rewards'
      }
    ];

    return (
      <Modal
        visible={showUpgradeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <BlurView intensity={20} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[DARK_GREEN, PRIMARY_GREEN]}
              style={styles.modalHeader}
            >
              <MaterialCommunityIcons name="crown" size={40} color="#FFD700" />
              <Text style={styles.modalTitle}>Upgrade to Premium</Text>
              <Text style={styles.modalSubtitle}>
                Unlock premium features and take your game to the next level
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
              <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
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
                onPress={() => setShowUpgradeModal(false)}
              >
                <Text style={styles.closeButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_GREEN} />

      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
        <LinearGradient
          colors={[DARK_GREEN, PRIMARY_GREEN]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.topBar}>
            <Link href="/" asChild>
              <TouchableOpacity style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            </Link>
            <Text style={styles.headerTitle}>Leaderboard</Text>
            <TouchableOpacity style={styles.infoButton} onPress={handleInfoPress}>
              <Ionicons name="information-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sportTabs}
            contentContainerStyle={styles.sportTabsContent}
          >
            {Object.keys(MOCK_RANKINGS).map((sport) => (
              <SportTab
                key={sport}
                sport={sport}
                isActive={selectedSport === sport}
                onPress={setSelectedSport}
              />
            ))}
          </ScrollView>

          <CategorySelector 
            category={selectedCategory}
            onSelect={handleCategorySelect}
          />

          {canAccessFeature('historical_data') && (
            <SeasonProgress
              season={CURRENT_SEASON}
              userTier="platinum"
            />
          )}
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.rankingsList}
        contentContainerStyle={styles.rankingsContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[PRIMARY_GREEN]}
            tintColor={PRIMARY_GREEN}
          />
        }
      >
        {isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_GREEN} />
          </View>
        ) : (
          <>
            {topThreePlayers.length === 3 && (
              <TopThreePlayers players={topThreePlayers} onPress={handleTopThreePress} />
            )}
            {otherPlayers.map((player, index) => (
              <PlayerCardComponent
                key={player.id}
                player={player}
                rank={index + 4}
                canViewDetails={canViewDetailedStats(player.id)}
                onPress={handlePlayerPress}
              />
            ))}
          </>
        )}
      </Animated.ScrollView>

      {renderPremiumModal()}

      {/* Rewards Modal */}
      <Modal
        visible={showRewardsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRewardsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={50} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Rewards</Text>
            <ScrollView style={styles.rewardsScroll}>
              <Text style={styles.sectionTitle}>Top 3 Players</Text>
              {topThreePlayers.map((player) => (
                <View key={player.id} style={styles.rewardItem}>
                  <MaterialCommunityIcons name="trophy-outline" size={20} color="#FFD700" />
                  <Text style={styles.rewardText}>{player.name} - Equipment/Voucher</Text>
                </View>
              ))}
              <Text style={styles.sectionTitle}>Ranks 4 and Below</Text>
              {otherPlayers.map((player) => (
                <View key={player.id} style={styles.rewardItem}>
                  <MaterialCommunityIcons name="currency-usd" size={20} color={PRIMARY_GREEN} />
                  <Text style={styles.rewardText}>{player.name} - {player.points} Points</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowRewardsModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
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
    zIndex: 100,
    backgroundColor: DARK_GREEN,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  infoButton: {
    padding: 8,
  },
  sportTabs: {
    marginBottom: 12,
  },
  sportTabsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sportTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  sportTabActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sportTabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  sportTabTextActive: {
    fontWeight: '600',
  },
  categorySelector: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoryFilterContent: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  categoryButtonTextActive: {
    fontWeight: '600',
  },
  premiumIcon: {
    marginLeft: 4,
  },
  rankingsList: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 180 : 200,
  },
  rankingsContent: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  playerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  userPlayerCard: {
    borderWidth: 2,
    borderColor: PRIMARY_GREEN,
  },
  playerRankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a472a',
    marginRight: 4,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  playerInfo: {
    flex: 1,
  },
  playerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  youLabel: {
    backgroundColor: PRIMARY_GREEN,
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a472a',
  },
  playerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pointsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  performanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a472a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#eee',
  },
  recentMatches: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  matchResult: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchResultText: {
    fontSize: 12,
    fontWeight: '700',
  },
  achievementBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  achievementBadge: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  premiumIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  premiumIndicatorText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  seasonContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  seasonGradient: {
    padding: 16,
  },
  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seasonName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  seasonTimeRemaining: {
    fontSize: 14,
    color: '#fff',
  },
  seasonRewards: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 12,
  },
  seasonTierReward: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 8,
  },
  rewardsList: {
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  topThreeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
  },
  topPlayerWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  firstPlace: {
    marginTop: -20,
  },
  crownContainer: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  runnerUpAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  winnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
    maxWidth: 100,
    textAlign: 'center',
  },
  runnerUpName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
    maxWidth: 90,
    textAlign: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  winnerPoints: {
    backgroundColor: '#FFD700',
  },
  winnerPointsText: {
    color: '#000',
  },
  ptsLabel: {
    fontSize: 12,
    color: '#666',
  },
  winnerPtsLabel: {
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalContent: {
    flex: 1,
    marginTop: 100,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 24,
    alignItems: 'center',
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
    alignItems: 'center',
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
    color: '#1a472a',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
  },
  modalFooter: {
    padding: 24,
    paddingTop: 0,
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 12,
  },
  upgradeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
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
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  rewardsScroll: {
    width: '100%',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 8,
    marginTop: 12,
  },
  modalCloseText: {
    fontSize: 14,
    color: PRIMARY_GREEN,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
});
