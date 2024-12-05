// app/dashboard.js
import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const LIGHT_GREEN = '#4caf50';

// Card Component
const Card = ({ children, style, gradient }) => {
  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.card, style]}
      >
        {children}
      </LinearGradient>
    );
  }
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const Dashboard = () => {
  // State declarations
  const [walletBalance, setWalletBalance] = useState(250);
  const [membershipTier, setMembershipTier] = useState('Gold');
  const [points, setPoints] = useState(1250);
  const [checkInStreak, setCheckInStreak] = useState(4);
  const [lastCheckIn, setLastCheckIn] = useState(false);
  
  // Quests state
  const [quests, setQuests] = useState([
    {
      id: 1,
      title: "Weekend Warrior",
      description: "Play 3 matches this weekend",
      progress: 2,
      total: 3,
      reward: "200 Points",
      expires: "2 days left",
      completed: false,
      claimed: false
    },
    {
      id: 2,
      title: "Early Bird",
      description: "Book a court before 9AM",
      progress: 1,
      total: 1,
      reward: "30% Off Voucher",
      expires: "5 days left",
      completed: true,
      claimed: false
    },
    {
      id: 3,
      title: "Social Butterfly",
      description: "Play with 5 different partners",
      progress: 3,
      total: 5,
      reward: "500 Points",
      expires: "Weekly Quest",
      completed: false,
      claimed: false
    }
  ]);

  // Vouchers state
  const [vouchers, setVouchers] = useState([
    { id: 1, code: "SPORT50", discount: "¥50 off", expires: "Dec 15", type: "regular" },
    { id: 2, code: "NEWYR24", discount: "20% off", expires: "Jan 1", type: "premium" }
  ]);

  // Premium benefits
  const premiumBenefits = [
    "Unlimited access to gameplay statistics",
    "20% discount on all bookings",
    "2x points on every activity",
    "Priority court booking (up to 2 weeks in advance)",
    "Free equipment rental monthly",
    "Exclusive premium-only events"
  ];

  // Check-in rewards
  const checkInRewards = [
    { day: 1, reward: "50 Points", claimed: true },
    { day: 2, reward: "75 Points", claimed: true },
    { day: 3, reward: "100 Points", claimed: true },
    { day: 4, reward: "Premium Voucher", claimed: true },
    { day: 5, reward: "150 Points", claimed: false },
    { day: 6, reward: "200 Points", claimed: false },
    { day: 7, reward: "500 Points + Mystery Box", claimed: false }
  ];

  // Upcoming activities state
  const [upcomingActivities, setUpcomingActivities] = useState([
    {
      id: 1,
      type: 'booking',
      sport: 'Badminton',
      venue: "XJTLU Sports Centre",
      court: "Court A3",
      time: "Today, 18:00-20:00",
      status: 'upcoming',
      participants: ['John L.', 'Mike R.'],
      totalSlots: 4,
      location: "111 XJTLU South Campus, Taicang",
      price: "¥25/hour",
      equipmentIncluded: true,
      level: "Intermediate",
      hostName: "John L.",
      hostRating: 4.8,
      additionalInfo: "Shuttlecocks provided"
    },
    {
      id: 2,
      type: 'ongoing',
      sport: 'Tennis',
      venue: "Taicang Sports Complex",
      court: "Tennis Court 2",
      time: "Now (Started 45min ago)",
      status: 'in-progress',
      score: '6-4, 3-2',
      participants: ['Sarah K.', 'Emma W.'],
      location: "123 Taicang Road, Downtown Taicang",
      price: "¥35/hour",
      level: "Advanced",
      hostName: "Sarah K.",
      hostRating: 4.9,
      matchType: "Singles",
      currentSet: 2
    }
  ]);

  // ... (other state declarations remain the same)

  const handleCheckIn = useCallback(() => {
    setLastCheckIn(true);
    setCheckInStreak(prev => prev + 1);
  }, []);

  const handleQuestClaim = useCallback((questId) => {
    setQuests(quests.map(quest => {
      if (quest.id === questId) {
        if (quest.reward.includes('Voucher')) {
          setVouchers(prev => [...prev, {
            id: Date.now(),
            code: `QUEST${questId}`,
            discount: quest.reward,
            expires: "30 days",
            type: "quest"
          }]);
        } else {
          const pointsToAdd = parseInt(quest.reward);
          setPoints(prev => prev + pointsToAdd);
        }
        return { ...quest, claimed: true };
      }
      return quest;
    }));
  }, [quests]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Financial Overview Section */}
        <View style={styles.section}>
          {/* Wallet Card */}
          <Card style={styles.walletCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="wallet" size={24} color={PRIMARY_GREEN} />
              <Text style={styles.cardTitle}>Wallet Balance</Text>
            </View>
            <Text style={styles.balanceText}>¥{walletBalance}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>Last topped up: Dec 1</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Top up</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={PRIMARY_GREEN} />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Premium Membership Card */}
          <Card 
            gradient={[DARK_GREEN, PRIMARY_GREEN]} 
            style={styles.membershipCard}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="crown" size={24} color="#fff" />
              <Text style={[styles.cardTitle, styles.whiteText]}>Premium Member</Text>
            </View>
            <View style={styles.tierContainer}>
              <Text style={[styles.tierText, styles.whiteText]}>{membershipTier}</Text>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressText, styles.whiteText]}>
                  250 points to Platinum
                </Text>
                <Text style={[styles.progressText, styles.whiteText]}>
                  2x Points Active
                </Text>
              </View>
            </View>
          </Card>

          {/* Points Card */}
          <Card style={styles.pointsCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="star" size={24} color={PRIMARY_GREEN} />
              <Text style={styles.cardTitle}>Reward Points</Text>
            </View>
            <Text style={styles.pointsText}>{points}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>Valid until Dec 31</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Redeem</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={PRIMARY_GREEN} />
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Premium Benefits Section */}
        <Card gradient={[DARK_GREEN, PRIMARY_GREEN]} style={styles.benefitsCard}>
          <View style={styles.benefitsHeader}>
            <MaterialCommunityIcons name="crown" size={24} color="#fff" />
            <Text style={[styles.cardTitle, styles.whiteText]}>
              Premium Membership Benefits
            </Text>
          </View>
          <View style={styles.benefitsGrid}>
            {premiumBenefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <MaterialCommunityIcons 
                  name="star-shooting" 
                  size={16} 
                  color="#FFD700" 
                />
                <Text style={[styles.benefitText, styles.whiteText]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </Card>

        {/* Active Quests Section */}
        <Card style={styles.questsCard}>
          {/* Quests Section */}
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="trophy" size={24} color={PRIMARY_GREEN} />
            <Text style={styles.cardTitle}>Active Quests</Text>
          </View>
          <View style={styles.questsList}>
            {quests.map((quest) => (
              <View 
                key={quest.id}
                style={[
                  styles.questItem,
                  quest.completed && styles.questItemCompleted
                ]}
              >
                <View style={styles.questHeader}>
                  <View style={styles.questTitleContainer}>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    {quest.claimed && (
                      <MaterialCommunityIcons 
                        name="check-circle" 
                        size={16} 
                        color={PRIMARY_GREEN} 
                      />
                    )}
                  </View>
                  <View style={styles.questRewardBadge}>
                    <Text style={styles.questRewardText}>{quest.reward}</Text>
                  </View>
                </View>
                
                <Text style={styles.questDescription}>{quest.description}</Text>
                
                <View style={styles.questProgress}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${(quest.progress / quest.total) * 100}%`,
                          backgroundColor: PRIMARY_GREEN 
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.questProgressLabels}>
                    <Text style={styles.questProgressText}>
                      {quest.progress}/{quest.total} completed
                    </Text>
                    <Text style={styles.questProgressText}>{quest.expires}</Text>
                  </View>
                </View>

                {quest.completed && !quest.claimed && (
                  <TouchableOpacity 
                    style={styles.claimButton}
                    onPress={() => handleQuestClaim(quest.id)}
                  >
                    <Text style={styles.claimButtonText}>Claim</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </Card>

        {/* Check-in Rewards Section */}
        <Card style={styles.checkInCard}>
          <View style={styles.checkInHeader}>
            <MaterialCommunityIcons name="gift" size={24} color={PRIMARY_GREEN} />
            <Text style={styles.cardTitle}>Daily Check-in</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{checkInStreak} Day Streak</Text>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.rewardsScroll}
            contentContainerStyle={styles.rewardsScrollContent}
          >
            {checkInRewards.map((reward, index) => (
              <View
                key={index}
                style={[
                  styles.rewardDay,
                  reward.claimed && styles.rewardDayClaimed,
                  !reward.claimed && index === checkInStreak && styles.rewardDayActive,
                  !reward.claimed && index !== checkInStreak && styles.rewardDayDefault,
                ]}
              >
                <Text style={styles.rewardDayText}>Day {index + 1}</Text>
                <MaterialCommunityIcons 
                  name="gift-outline" 
                  size={24} 
                  color={reward.claimed ? PRIMARY_GREEN : '#666'} 
                />
                <Text style={styles.rewardText}>{reward.reward}</Text>
                {reward.claimed && (
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={20} 
                    color={PRIMARY_GREEN}
                    style={{ position: 'absolute', top: -8, right: -8 }}
                  />
                )}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={handleCheckIn}
            disabled={lastCheckIn}
            style={[
              styles.checkInButton,
              lastCheckIn ? styles.checkInButtonDisabled : styles.checkInButtonEnabled,
            ]}
          >
            <Text style={[
              styles.checkInButtonText,
              { color: lastCheckIn ? '#666' : '#fff' }
            ]}>
              {lastCheckIn ? 'Already Checked In Today' : 'Check In Now'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Vouchers Section */}
        <Card style={styles.vouchersCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="ticket-percent" size={24} color={PRIMARY_GREEN} />
            <Text style={styles.cardTitle}>Your Vouchers</Text>
          </View>

          <View style={styles.vouchersList}>
            {vouchers.map((voucher) => (
              <View
                key={voucher.id}
                style={[
                  styles.voucherItem,
                  voucher.type === 'premium' && styles.voucherItemPremium
                ]}
              >
                {voucher.type === 'premium' && (
                  <View style={styles.premiumTag}>
                    <Text style={styles.premiumTagText}>PREMIUM</Text>
                  </View>
                )}
                
                <View style={styles.voucherContent}>
                  <View>
                    <Text style={styles.voucherCode}>{voucher.code}</Text>
                    <Text style={styles.voucherDiscount}>{voucher.discount}</Text>
                    <Text style={styles.voucherExpiry}>Expires {voucher.expires}</Text>
                  </View>
                  
                  <TouchableOpacity style={styles.useVoucherButton}>
                    <Text style={styles.useVoucherButtonText}>Use Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.activitiesCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="calendar" size={24} color={PRIMARY_GREEN} />
            <Text style={styles.cardTitle}>Your Activities</Text>
          </View>

          {upcomingActivities.map((activity) => (
            <View
              key={activity.id}
              style={[
                styles.activityItem,
                activity.status === 'in-progress' && styles.activityItemInProgress,
              ]}
            >
              <View style={styles.activityHeader}>
                <View style={styles.activityInfo}>
                  <View style={[
                    styles.sportIconContainer,
                    activity.status === 'in-progress' && { backgroundColor: '#e8f5e9' }
                  ]}>
                    <MaterialCommunityIcons 
                      name={activity.sport.toLowerCase()} 
                      size={24} 
                      color={activity.status === 'in-progress' ? PRIMARY_GREEN : '#666'} 
                    />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityTitle}>{activity.sport}</Text>
                    <Text style={styles.activityLocation}>
                      {activity.venue} • {activity.court}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                  {activity.status === 'in-progress' && (
                    <View style={styles.activityStatus}>
                      <Text style={styles.activityStatusText}>In Progress</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.activityDetailsRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                <Text style={styles.activityDetailsText}>{activity.location}</Text>
              </View>

              <View style={styles.activityDetailsRow}>
                <MaterialCommunityIcons name="currency-usd" size={16} color="#666" />
                <Text style={styles.activityDetailsText}>{activity.price}</Text>
                <MaterialCommunityIcons name="account-group" size={16} color="#666" style={styles.detailIcon} />
                <Text style={styles.activityDetailsText}>{activity.level}</Text>
              </View>

              {activity.hostName && (
                <View style={styles.hostContainer}>
                  <View style={styles.hostInfo}>
                    <MaterialCommunityIcons name="account-circle" size={20} color={PRIMARY_GREEN} />
                    <Text style={styles.hostName}>{activity.hostName}</Text>
                    <View style={styles.hostRating}>
                      <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                      <Text style={styles.hostRatingText}>{activity.hostRating}</Text>
                    </View>
                  </View>
                </View>
              )}

              {activity.description && (
                <Text style={styles.activityDescription}>{activity.description}</Text>
              )}

              <View style={styles.participantsContainer}>
                <View style={styles.participantAvatars}>
                  {activity.participants.map((participant, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.participantCircle,
                        { zIndex: activity.participants.length - index }
                      ]}
                    >
                      <Text style={styles.participantInitial}>
                        {participant.charAt(0)}
                      </Text>
                    </View>
                  ))}
                </View>
                {activity.totalSlots && (
                  <Text style={styles.participantCount}>
                    {activity.participants.length}/{activity.totalSlots} players
                  </Text>
                )}
                {activity.status === 'in-progress' && activity.score && (
                  <Text style={[styles.participantCount, { marginLeft: 'auto', color: PRIMARY_GREEN }]}>
                    Score: {activity.score}
                  </Text>
                )}
              </View>

              {activity.amenities && (
                <View style={styles.amenitiesContainer}>
                  {activity.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityTag}>
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
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
  walletCard: {
    padding: 16,
  },
  membershipCard: {
    padding: 16,
  },
  pointsCard: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_GREEN,
  },
  whiteText: {
    color: '#fff',
  },
  balanceText: {
    fontSize: 32,
    fontWeight: '700',
    color: PRIMARY_GREEN,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: PRIMARY_GREEN,
    fontWeight: '500',
  },
  tierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tierText: {
    fontSize: 20,
    fontWeight: '600',
  },
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
  },
  pointsText: {
    fontSize: 32,
    fontWeight: '700',
    color: PRIMARY_GREEN,
    marginBottom: 8,
  },
  benefitsCard: {
    margin: 16,
    padding: 16,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%',
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: DARK_GREEN,
    fontSize: 16,
    fontWeight: '600',
  },
  questsCard: {
    margin: 16,
    padding: 16,
  },
  questsList: {
    gap: 16,
  },
  questItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  questItemCompleted: {
    borderColor: PRIMARY_GREEN,
    backgroundColor: '#e8f5e9',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  questRewardBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questRewardText: {
    color: PRIMARY_GREEN,
    fontSize: 12,
    fontWeight: '500',
  },
  questDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  questProgress: {
    marginTop: 8,
  },
  questProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  questProgressText: {
    fontSize: 12,
    color: '#666',
  },
  claimButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  // Check-in Rewards styles
  checkInCard: {
    margin: 16,
    padding: 16,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  streakBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    color: PRIMARY_GREEN,
    fontSize: 12,
    fontWeight: '500',
  },
  rewardsScroll: {
    marginBottom: 16,
  },
  rewardsScrollContent: {
    gap: 12,
    paddingHorizontal: 4,
  },
  rewardDay: {
    width: 100,
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  rewardDayClaimed: {
    borderColor: PRIMARY_GREEN,
    backgroundColor: '#e8f5e9',
  },
  rewardDayActive: {
    borderColor: '#FFD700',
    backgroundColor: '#FFF8E1',
  },
  rewardDayDefault: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  rewardDayText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  checkInButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkInButtonEnabled: {
    backgroundColor: PRIMARY_GREEN,
  },
  checkInButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Activities styles
  activitiesCard: {
    margin: 16,
    padding: 16,
  },
  activityItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  activityItemInProgress: {
    borderColor: PRIMARY_GREEN,
    backgroundColor: '#e8f5e9',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityLocation: {
    fontSize: 14,
    color: '#666',
  },
  activityTime: {
    fontSize: 14,
    textAlign: 'right',
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    alignSelf: 'flex-start',
  },
  activityStatusText: {
    fontSize: 12,
    color: PRIMARY_GREEN,
    fontWeight: '500',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  participantAvatars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  participantCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  participantInitial: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  participantCount: {
    fontSize: 12,
    color: '#666',
  },
  activityDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  activityDetailsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  detailIcon: {
    marginLeft: 16,
  },
  hostContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  hostRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  hostRatingText: {
    fontSize: 12,
    color: '#f57c00',
    marginLeft: 4,
    fontWeight: '500',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  amenityTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amenityText: {
    fontSize: 12,
    color: PRIMARY_GREEN,
  },
  // Voucher styles
  vouchersCard: {
    margin: 16,
    padding: 16,
  },
  vouchersList: {
    gap: 12,
  },
  voucherItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  voucherItemPremium: {
    borderColor: '#FFD700',
    backgroundColor: '#FFF8E1',
  },
  premiumTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  premiumTagText: {
    color: '#7B5801',
    fontSize: 12,
    fontWeight: '600',
  },
  voucherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voucherCode: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  voucherDiscount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  voucherExpiry: {
    fontSize: 12,
    color: '#999',
  },
  useVoucherButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  useVoucherButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Dashboard;