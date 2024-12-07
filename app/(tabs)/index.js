// app/index.js
import React, { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Platform,
  Animated 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const LIGHT_GREEN = '#4caf50';

export default function Home() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState(null);
  const [scrollY] = useState(new Animated.Value(0));

  const recommendedSports = [
    { 
      name: 'Badminton',
      icon: 'badminton',
      players: '2-4 players',
      level: 'All levels',
      gradient: [LIGHT_GREEN, DARK_GREEN]
    },
    { 
      name: 'Basketball',
      icon: 'basketball',
      players: '5v5',
      level: 'Intermediate',
      gradient: [PRIMARY_GREEN, DARK_GREEN]
    },
    { 
      name: 'Tennis',
      icon: 'tennis',
      players: '2-4 players',
      level: 'Beginner friendly',
      gradient: [LIGHT_GREEN, PRIMARY_GREEN]
    }
  ];

  const equipmentRental = [
    { 
      name: 'Badminton Racket',
      price: '¥15/hr',
      rating: 4.8,
      image: require('../../assets/equipment/badminton-racket.jpg'),
      sportType: 'badminton'
    },
    { 
      name: 'Tennis Racket',
      price: '¥20/hr',
      rating: 4.6,
      image: require('../../assets/equipment/tennis-racket.jpg'),
      sportType: 'tennis'
    },
    { 
      name: 'Basketball',
      price: '¥10/hr',
      rating: 4.9,
      image: require('../../assets/equipment/basketball.jpg'),
      sportType: 'basketball'
    }
  ];

  const quickActions = [
    { icon: 'account-multiple', text: 'Community', route: '/community' },
    { icon: 'timer', text: 'Sparring', route: '/sparring' },
    { icon: 'medal', text: 'Leaderboard', route: '/leaderboard' },
    { icon: 'trophy', text: 'Competition', route: '/competitions' }
  ];

  const upcomingEvents = [
    {
      title: "TC Sports Hub - Evening Session",
      sport: "Badminton",
      level: "Beginner - Pro",
      time: "Tue, Dec 03 2024, 19:00 - 21:00",
      location: "Taicang Sports Complex, Building B",
      participants: [
        { id: 1, initial: "AA" },
        { id: 2, initial: "MZ" },
      ],
      totalSpots: 9,
      filledSpots: 6,
      status: "confirmed",
      isSuperhost: true,
      isBookedViaAyo: true
    }
  ];

  // Header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [160, 100], // Increased initial height for more green area
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.98],
    extrapolate: 'clamp'
  });

  const handleSportSelect = (sport) => {
    if (selectedSport === sport.name) {
      router.push({
        pathname: "/venue-booking",
        params: { sport: sport.name }
      });
    } else {
      setSelectedSport(sport.name);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
        <LinearGradient
          colors={[DARK_GREEN, PRIMARY_GREEN]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.searchSection}>
            <View style={styles.locationBar}>
              <Ionicons name="location-outline" size={20} color="#fff" />
              <Text style={styles.locationText}>All Locations</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#fff" />
            </View>
            <BlurView intensity={20} tint="light" style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#fff" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for activities..."
                placeholderTextColor="rgba(255,255,255,0.7)"
              />
            </BlurView>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons name="dice-multiple" size={24} color="#fff" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>4</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        style={[styles.content]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Sports Selection */}
        <View style={styles.sportsForYou}>
          <Text style={styles.sectionTitle}>Recommended Sports</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sportsContainer}
          >
            {recommendedSports.map((sport, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.sportCard,
                  selectedSport === sport.name && styles.selectedSportCard
                ]}
                onPress={() => handleSportSelect(sport)}
              >
                <LinearGradient
                  colors={sport.gradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.sportCardGradient}
                >
                  <BlurView intensity={20} tint="light" style={styles.sportIconContainer}>
                    <MaterialCommunityIcons name={sport.icon} size={40} color="#fff" />
                  </BlurView>
                  <View style={styles.sportInfo}>
                    <Text style={styles.sportName}>{sport.name}</Text>
                    <Text style={styles.sportDetails}>{sport.players}</Text>
                    <Text style={styles.sportLevel}>{sport.level}</Text>
                  </View>
                  {selectedSport === sport.name && (
                    <View style={styles.sportSelectedIndicator}>
                      <Text style={styles.sportSelectedText}>Tap to book</Text>
                      <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={[PRIMARY_GREEN, DARK_GREEN]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.statsGradient}
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Active Venues</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>138</Text>
              <Text style={styles.statLabel}>Players Online</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>45</Text>
              <Text style={styles.statLabel}>Events Today</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Equipment Rental */}
        <View style={styles.rentalSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Equipment Rental</Text>
            <Link href="/equipment" asChild>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="arrow-forward" size={20} color={PRIMARY_GREEN} />
              </TouchableOpacity>
            </Link>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {equipmentRental.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.rentalCard}
                onPress={() => router.push('/equipment')}
              >
                <ImageBackground
                  source={item.image}
                  style={styles.rentalBackground}
                  imageStyle={styles.rentalBackgroundImage}
                >
                  <LinearGradient
                    colors={['rgba(46,125,50,0.3)', 'rgba(26,71,42,0.95)']}
                    start={{x: 0, y: 0}}
                    end={{x: 0, y: 1}}
                    style={styles.rentalCardGradient}
                  >
                    <MaterialCommunityIcons 
                      name={item.sportType} 
                      size={24} 
                      color="#fff" 
                      style={styles.rentalIcon}
                    />
                    <View style={styles.rentalInfo}>
                      <Text style={styles.rentalName}>{item.name}</Text>
                      <Text style={styles.rentalPrice}>{item.price}</Text>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <Link key={index} href={action.route} asChild>
              <TouchableOpacity style={styles.quickActionItem}>
                <View style={styles.quickActionIcon}>
                  <MaterialCommunityIcons name={action.icon} size={24} color={PRIMARY_GREEN} />
                </View>
                <Text style={styles.quickActionText}>{action.text}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Upcoming Events */}
        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Find buddies to play with</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="arrow-forward" size={20} color={PRIMARY_GREEN} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {upcomingEvents.map((event, index) => (
              <TouchableOpacity key={index} style={styles.eventCard}>
                <BlurView intensity={80} tint="light" style={styles.eventCardContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventDetail}>
                    <MaterialCommunityIcons name="badminton" size={16} color="#666" />
                    <Text style={styles.eventDetailText}>
                      {event.sport} · {event.level}
                    </Text>
                  </View>
                  <View style={styles.eventDetail}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.eventDetailText}>{event.time}</Text>
                  </View>
                  <View style={styles.eventDetail}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.eventDetailText}>{event.location}</Text>
                  </View>

                  <View style={styles.eventFooter}>
                    <View style={styles.participantsList}>
                      {event.participants.map((participant, pIndex) => (
                        <View key={pIndex} style={styles.participantBadge}>
                          <Text style={styles.participantInitial}>{participant.initial}</Text>
                        </View>
                      ))}
                      <View style={styles.participantMore}>
                        <Text style={styles.participantMoreText}>
                          +{event.totalSpots - event.filledSpots}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.spotsText}>
                      {event.filledSpots}/{event.totalSpots} spots
                    </Text>
                  </View>

                  <View style={styles.eventTags}>
                    {event.status === "confirmed" && (
                      <View style={[styles.eventTag, styles.confirmedTag]}>
                        <Text style={styles.eventTagText}>Confirmed</Text>
                      </View>
                    )}
                    {event.isSuperhost && (
                      <View style={[styles.eventTag, styles.superhostTag]}>
                        <Text style={styles.eventTagText}>Superhost</Text>
                      </View>
                    )}
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
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
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  searchSection: {
    gap: 12,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 12,
  },
  iconButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#c41e3a',
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingTop: 140, // Increased this so content appears lower, showing more green
  },
  sportsForYou: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: DARK_GREEN,
    marginBottom: 16,
  },
  sportsContainer: {
    paddingRight: 16,
    gap: 16,
  },
  sportCard: {
    width: 180,
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: DARK_GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  selectedSportCard: {
    transform: [{ scale: 1.05 }],
  },
  sportCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  sportIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  sportInfo: {
    gap: 4,
  },
  sportName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  sportDetails: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  sportLevel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
  },
  sportSelectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
    marginTop: 12,
  },
  sportSelectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  rentalSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
  rentalCard: {
    width: 160,
    height: 200,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  rentalBackground: {
    flex: 1,
  },
  rentalBackgroundImage: {
    borderRadius: 16,
  },
  rentalCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  rentalIcon: {
    alignSelf: 'flex-end',
  },
  rentalInfo: {
    gap: 4,
  },
  rentalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  rentalPrice: {
    fontSize: 14,
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#FFD700',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 16,
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
  quickActionItem: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1f8e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: PRIMARY_GREEN,
    fontWeight: '500',
  },
  eventsSection: {
    padding: 16,
  },
  eventCard: {
    width: SCREEN_WIDTH * 0.85,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
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
  eventCardContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  eventFooter: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -8,
  },
  participantInitial: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  participantMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  participantMoreText: {
    color: PRIMARY_GREEN,
    fontSize: 12,
    fontWeight: '600',
  },
  spotsText: {
    color: '#666',
    fontSize: 14,
  },
  eventTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  eventTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confirmedTag: {
    backgroundColor: '#e8f5e9',
  },
  superhostTag: {
    backgroundColor: '#fff3e0',
  },
  eventTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: PRIMARY_GREEN,
  },
});
