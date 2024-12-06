// app/buddies.js
import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  PanResponder,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const LIGHT_GREEN = '#4caf50';

// Sample data
const USERS = [
  {
    id: 1,
    name: 'Sarah Chen',
    age: 24,
    photo: require('../assets/avatars/avatar5.jpg'),
    sports: ['Badminton', 'Tennis'],
    level: 'Intermediate',
    distance: '1.2 km away',
    availability: 'Weekday evenings',
    bio: 'Looking for badminton and tennis partners for regular practice sessions. I play at an intermediate level and am working on improving my serving technique.',
    stats: {
      matches: 48,
      winRate: '65%',
      rating: 4.8
    }
  },
  {
    id: 2,
    name: 'Mike Wilson',
    age: 28,
    photo: require('../assets/avatars/avatar6.jpg'),
    sports: ['Basketball', 'Swimming'],
    level: 'Advanced',
    distance: '0.8 km away',
    availability: 'Weekend mornings',
    bio: 'Former college basketball player looking for pickup games and swimming buddies. Always up for a challenge!',
    stats: {
      matches: 72,
      winRate: '71%',
      rating: 4.9
    }
  }
];

const getSportIcon = (sport) => {
  const iconMap = {
    'Swimming': 'swim',
    'Basketball': 'basketball',
    'Badminton': 'badminton',
    'Tennis': 'tennis',
    'Volleyball': 'volleyball',
    'Soccer': 'soccer',
    'Running': 'run',
    'Cycling': 'bike',
    'Golf': 'golf',
    'Table Tennis': 'table-tennis',
    // Add more mappings as needed
  };
  return iconMap[sport] || sport.toLowerCase();
};

const CardContent = React.memo(({ user }) => (
  <>
    <Image source={user.photo} style={styles.cardImage} />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      style={styles.cardGradient}
    >
      <View style={styles.userInfo}>
        <View style={styles.nameContainer}>
          <Text style={styles.userName}>{user.name}, {user.age}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{user.level}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="trophy" size={16} color="#FFD700" />
            <Text style={styles.statText}>{user.stats.matches} matches</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.statText}>{user.stats.rating} rating</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="trending-up" size={16} color="#FFD700" />
            <Text style={styles.statText}>{user.stats.winRate} wins</Text>
          </View>
        </View>

        <View style={styles.sportsContainer}>
          {user.sports.map((sport, index) => (
            <View key={index} style={styles.sportTag}>
              <MaterialCommunityIcons 
                name={getSportIcon(sport)} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.sportText}>{sport}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.bio}>{user.bio}</Text>

        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#fff" />
          <Text style={styles.locationText}>{user.distance}</Text>
          <View style={styles.dot} />
          <Ionicons name="time" size={16} color="#fff" />
          <Text style={styles.locationText}>{user.availability}</Text>
        </View>
      </View>
    </LinearGradient>
  </>
));

export default function BuddyFinder() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.9, 1],
    extrapolate: 'clamp'
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset index and animate back in
    setCurrentIndex(0);
    setIsRefreshing(false);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const swipe = useCallback((direction) => {
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : 
              direction === 'left' ? -SCREEN_WIDTH * 1.5 : 0;
    const y = direction === 'up' ? -SCREEN_HEIGHT : 0;
    Animated.timing(position, {
      toValue: { x, y },
      duration: 400,
      useNativeDriver: false
    }).start(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      position.setValue({ x: 0, y: 0 });
    });
  }, [position]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      position.setValue({ x: gestureState.dx, y: gestureState.dy });
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > SWIPE_THRESHOLD) {
        swipe('right');
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        swipe('left');
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 4,
          useNativeDriver: false
        }).start();
      }
    }
  }), [position, swipe]);

  const renderCard = (user, index) => {
    if (index < currentIndex) return null;

    // Top card
    if (index === currentIndex) {
      const cardStyle = {
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate: rotation }
        ],
        zIndex: 2,
        elevation: 2
      };

      return (
        <Animated.View 
          key={user.id} 
          style={[styles.card, cardStyle]} 
          {...panResponder.panHandlers}
        >
          <CardContent user={user} />
          <Animated.View style={[styles.likeStamp, { opacity: likeOpacity }]}>
            <Text style={[styles.stampText, { color: '#2196f3' }]}>BUDDY!</Text>
          </Animated.View>
          <Animated.View style={[styles.nopeStamp, { opacity: nopeOpacity }]}>
            <Text style={[styles.stampText, { color: '#ff4444' }]}>PASS</Text>
          </Animated.View>
        </Animated.View>
      );
    }

    // Next card
    if (index === currentIndex + 1) {
      const cardStyle = {
        transform: [{ scale: nextCardScale }],
        position: 'absolute',
        zIndex: 1,
        elevation: 1
      };

      return (
        <Animated.View key={user.id} style={[styles.card, cardStyle]}>
          <CardContent user={user} />
        </Animated.View>
      );
    }

    return null;
  };

  if (currentIndex >= USERS.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <MaterialCommunityIcons 
              name="account-group" 
              size={120} 
              color="#ddd" 
            />
            <Text style={styles.emptyStateText}>Unlock More Profiles</Text>
            <Text style={styles.emptyStateSubText}>
              Become a member to connect with more sports buddies in your area!
            </Text>
            <TouchableOpacity 
              style={styles.memberButton}
              onPress={() => {
                // Add your membership upgrade navigation logic here.
                console.log('Navigate to membership upgrade page');
              }}
            >
              <Text style={styles.memberButtonText}>
                Become a Premium Member
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

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
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.headerTitle}>Find Sports Buddies</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {USERS.map((user, index) => renderCard(user, index))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.passButton]}
          onPress={() => swipe('left')}
        >
          <Ionicons name="close" size={32} color="#ff4444" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => swipe('up')}
        >
          <Ionicons name="star" size={32} color="#4caf50" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => swipe('right')}
        >
          <Ionicons name="checkmark" size={32} color="#2196f3" />
        </TouchableOpacity>
      </View>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    padding: 8,
  },
  filterButton: {
    padding: 8,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -60,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  userInfo: {
    gap: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  levelBadge: {
    backgroundColor: 'rgba(76,175,80,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRIMARY_GREEN,
  },
  levelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  sportText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  bio: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 24,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  passButton: {
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  superLikeButton: {
    borderWidth: 2,
    borderColor: PRIMARY_GREEN,
  },
  likeButton: {
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  likeStamp: {
    position: 'absolute',
    top: 50,
    right: 40,
    transform: [{ rotate: '30deg' }],
    borderWidth: 4,
    borderColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(33,150,243,0.2)',
    zIndex: 1000,
  },
  nopeStamp: {
    position: 'absolute',
    top: 50,
    left: 40,
    transform: [{ rotate: '-30deg' }],
    borderWidth: 4,
    borderColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,68,68,0.2)',
    zIndex: 1000,
  },
  stampText: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyStateSubText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  memberButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  memberButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
