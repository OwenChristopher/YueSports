// app/sparring.js

import React, { useState, useCallback, useRef } from 'react';
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
  TextInput,
  PanResponder,
  Alert,
  Dimensions
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Constants
const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const LIGHT_GREEN = '#4caf50';

// Get device width for responsive design
const { width } = Dimensions.get('window');
const BUDDY_CARD_WIDTH = 120;
const BUDDY_CARD_HEIGHT = 140;

// Updated BUDDIES_DATA
const BUDDIES_DATA = [
  {
    id: 1,
    name: "Anderson Goat",
    avatar: require('../assets/avatars/avatar3.jpg'),
    primarySport: { name: "Tennis", icon: "tennis" },
    isOnline: true,
    lastActive: "Now",
  },
  {
    id: 2,
    name: "Clarine",
    avatar: require('../assets/avatars/avatard.jpg'),
    primarySport: { name: "Badminton", icon: "badminton" },
    isOnline: false,
    lastActive: "2h ago",
  },
  {
    id: 3,
    name: "Daniil",
    avatar: require('../assets/avatars/avatard.jpg'),
    primarySport: { name: "Basketball", icon: "basketball" },
    isOnline: true,
    lastActive: "Now",
  },
  {
    id: 4,
    name: "John Lemington",
    avatar: require('../assets/avatars/avatar4.jpg'),
    primarySport: { name: "Tennis", icon: "tennis" },
    isOnline: false,
    lastActive: "1d ago",
  },
  {
    id: 5,
    name: "Lin Wang",
    avatar: require('../assets/avatars/avatard.jpg'),
    primarySport: { name: "Badminton", icon: "badminton" },
    isOnline: true,
    lastActive: "Now",
  },
  {
    id: 6,
    name: "Mackenzie",
    avatar: require('../assets/avatars/avatard.jpg'),
    primarySport: { name: "Tennis", icon: "tennis" },
    isOnline: false,
    lastActive: "5h ago",
  },
  {
    id: 7,
    name: "Mike Liu",
    avatar: require('../assets/avatars/avatarX.jpg'),
    primarySport: { name: "Basketball", icon: "basketball" },
    isOnline: true,
    lastActive: "Now",
  },
  {
    id: 8,
    name: "Regina ❤️",
    avatar: require('../assets/avatars/avatar1.jpg'),
    primarySport: { name: "Badminton", icon: "badminton" },
    isOnline: true,
    lastActive: "Now",
  },
  {
    id: 9,
    name: "Yang Yang",
    avatar: require('../assets/avatars/avatard.jpg'),
    primarySport: { name: "Tennis", icon: "tennis" },
    isOnline: false,
    lastActive: "3h ago",
  },
].sort((a, b) => a.name.localeCompare(b.name));

// Mock data for Friends Nearby - Assuming you want to keep this separate
const MOCK_FRIENDS = [
  {
    id: 1,
    name: "Regina Chen",
    avatar: require('../assets/avatars/avatar1.jpg'),
    sports: ["Badminton", "Tennis"],
    level: "Casual",
    lastPlayed: "2 days ago"
  },
  {
    id: 2,
    name: "Mike Wilson",
    avatar: require('../assets/avatars/avatar2.jpg'),
    sports: ["Basketball", "Tennis"],
    level: "Intermediate",
    lastPlayed: "Yesterday"
  }
];

const MOCK_MATCHES = [
  {
    id: 1,
    type: 'friendly',
    players: [
      {
        name: "Regina Chen",
        avatar: require('../assets/avatars/avatar1.jpg')
      },
      {
        name: "You",
        avatar: require('../assets/avatars/avatar2.jpg')
      }
    ],
    sport: "Badminton",
    time: "Today, 18:00",
    venue: "XJTLU Sports Center",
    court: "Court A1",
    status: "upcoming",
    note: "Casual game + coffee after! 🎭"
  },
  {
    id: 2,
    type: 'matchmaking',
    players: [
      {
        name: "Sarah K.",
        avatar: require('../assets/avatars/avatar3.jpg'),
        rating: 1650,
        level: "Intermediate"
      }
    ],
    sport: "Tennis",
    time: "Tomorrow, 10:00",
    venue: "Taicang Sports Complex",
    court: "Tennis Court 2",
    status: "pending",
    matchType: "Casual Practice"
  }
];

// CreateMatch Component
const CreateMatch = ({ onClose, onProceed }) => {
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedType, setSelectedType] = useState('friendly');
  const [note, setNote] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState([]);

  // New state to track selected buddies
  const [selectedBuddies, setSelectedBuddies] = useState([]);

  const slideAnim = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  const types = [
    { 
      id: 'friendly', 
      name: 'Friend Match', 
      description: 'Invite friends for a casual game',
      icon: 'people'
    },
    { 
      id: 'matchmaking', 
      name: 'Find Players', 
      description: 'Match with nearby players',
      icon: 'search'
    }
  ];

  const preferencesOptions = [
    "Casual Practice",
    "Similar Skill Level",
    "Learn & Improve",
    "Competitive"
  ];

  const togglePreference = (pref) => {
    setSelectedPreferences((prev) => 
      prev.includes(pref) 
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  // Function to toggle buddy selection
  const toggleBuddySelection = (buddyId) => {
    setSelectedBuddies((prev) =>
      prev.includes(buddyId)
        ? prev.filter(id => id !== buddyId)
        : [...prev, buddyId]
    );
  };

  // PanResponder for swipe-down to close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: Animated.event(
        [null, { dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      }
    })
  ).current;

  return (
    <View style={styles.modalOverlay}>
      <Animated.View 
        {...panResponder.panHandlers}
        style={[
          styles.fullScreenModal, 
          { transform: pan.getTranslateTransform() }
        ]}
      >
        <BlurView intensity={90} style={styles.modalBackground}>
          <View style={styles.modalContentFull}>
            <View style={styles.modalHandleBar} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Match</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Match Type Selection */}
              <Text style={styles.sectionTitle}>Match Type</Text>
              <View style={styles.typeContainer}>
                {types.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeCard,
                      selectedType === type.id && styles.typeCardSelected
                    ]}
                    onPress={() => setSelectedType(type.id)}
                  >
                    <LinearGradient
                      colors={selectedType === type.id ? 
                        [PRIMARY_GREEN, DARK_GREEN] : 
                        ['#fff', '#fff']
                      }
                      style={styles.typeCardGradient}
                    >
                      <Ionicons 
                        name={type.icon} 
                        size={24} 
                        color={selectedType === type.id ? '#fff' : PRIMARY_GREEN} 
                      />
                      <Text style={[
                        styles.typeCardTitle,
                        selectedType === type.id && styles.typeCardTitleSelected
                      ]}>
                        {type.name}
                      </Text>
                      <Text style={[
                        styles.typeCardDescription,
                        selectedType === type.id && styles.typeCardDescriptionSelected
                      ]}>
                        {type.description}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sport Selection */}
              <Text style={styles.sectionTitle}>Select Sport</Text>
              <View style={styles.sportsList}>
                {/* Define sports array */}
                {[
                  { id: 'badminton', name: 'Badminton', icon: 'badminton' },
                  { id: 'tennis', name: 'Tennis', icon: 'tennis' },
                  { id: 'basketball', name: 'Basketball', icon: 'basketball' }
                ].map(sport => (
                  <TouchableOpacity
                    key={sport.id}
                    style={[
                      styles.sportButton,
                      selectedSport === sport.id && styles.sportButtonSelected
                    ]}
                    onPress={() => setSelectedSport(sport.id)}
                  >
                    <MaterialCommunityIcons
                      name={sport.icon}
                      size={24}
                      color={selectedSport === sport.id ? '#fff' : '#666'}
                    />
                    <Text style={[
                      styles.sportButtonText,
                      selectedSport === sport.id && styles.sportButtonTextSelected
                    ]}>
                      {sport.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Depending on Match Type */}
              {selectedType === 'friendly' && (
                <>
                  {/* Add Note */}
                  <Text style={styles.sectionTitle}>Add Note (Optional)</Text>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="e.g., Casual game + coffee after!"
                    value={note}
                    onChangeText={setNote}
                    multiline
                    maxLength={100}
                  />

                  {/* Invite Buddies */}
                  <Text style={styles.sectionTitle}>Invite Buddies</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.buddiesList} // Updated style name
                  >
                    {BUDDIES_DATA.map(buddy => (
                      <TouchableOpacity 
                        key={buddy.id}
                        style={[
                          styles.buddyCard, // Updated style name
                          selectedBuddies.includes(buddy.id) && styles.buddyCardSelected
                        ]}
                        onPress={() => toggleBuddySelection(buddy.id)}
                      >
                        <Image 
                          source={buddy.avatar} 
                          style={styles.buddyAvatar} // Updated style name
                        />
                        <Text 
                          style={styles.buddyName}
                          numberOfLines={1}
                          ellipsizeMode='tail'
                        >
                          {buddy.name}
                        </Text>
                        <View style={styles.buddyInfo}>
                          <MaterialCommunityIcons
                            name={buddy.primarySport.icon}
                            size={16}
                            color={PRIMARY_GREEN}
                          />
                          <Text style={styles.buddySport}>{buddy.primarySport.name}</Text>
                        </View>
                        {/* Optional: Show online status */}
                        <View style={[
                          styles.onlineIndicator,
                          { backgroundColor: buddy.isOnline ? '#4caf50' : '#f44336' }
                        ]} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {selectedType === 'matchmaking' && (
                <>
                  {/* Match Preferences */}
                  <Text style={styles.sectionTitle}>Match Preferences</Text>
                  <View style={styles.preferencesContainer}>
                    {preferencesOptions.map((pref, i) => (
                      <TouchableOpacity 
                        key={i} 
                        style={[
                          styles.preferenceButton,
                          selectedPreferences.includes(pref) && styles.preferenceButtonSelected
                        ]}
                        onPress={() => togglePreference(pref)}
                      >
                        <Text style={[
                          styles.preferenceButtonText,
                          selectedPreferences.includes(pref) && styles.preferenceButtonTextSelected
                        ]}>{pref}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            {/* Send Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[
                  styles.createButton,
                  (!selectedSport || !selectedType || (selectedType === 'friendly' && selectedBuddies.length === 0)) && styles.createButtonDisabled
                ]}
                disabled={!selectedSport || !selectedType || (selectedType === 'friendly' && selectedBuddies.length === 0)}
                onPress={() => onProceed({ 
                  sport: selectedSport, 
                  type: selectedType,
                  note, 
                  preferences: selectedPreferences,
                  buddies: selectedBuddies // Pass selected buddies
                })}
              >
                <Text style={styles.createButtonText}>
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
};

// MatchCard Component
const MatchCard = ({ match, onPress }) => {
  const isFriendly = match.type === 'friendly';

  return (
    <TouchableOpacity 
      style={styles.matchCard} 
      onPress={onPress}
    >
      <View style={styles.matchHeader}>
        <View style={styles.matchType}>
          <MaterialCommunityIcons
            name={match.sport.toLowerCase()}
            size={24}
            color={PRIMARY_GREEN}
          />
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>
              {isFriendly ? 'Friendly' : 'Matchmaking'}
            </Text>
          </View>
        </View>
        {match.status === 'pending' && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Pending</Text>
          </View>
        )}
      </View>

      <View style={styles.playersContainer}>
        {match.players.map((player, index) => (
          <View key={index} style={styles.playerInfo}>
            <Image 
              source={player.avatar}
              style={styles.playerAvatar}
            />
            <Text style={styles.playerName}>{player.name}</Text>
            {player.level && (
              <Text style={styles.playerLevel}>{player.level}</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.matchDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{match.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {match.venue} • {match.court}
          </Text>
        </View>
        {match.note && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>{match.note}</Text>
          </View>
        )}
      </View>

      {match.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.declineButton}>
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Main Sparring Component
export default function Sparring() {
  const router = useRouter();
  const [showCreateMatch, setShowCreateMatch] = useState(false);

  const handleMatchPress = useCallback((matchId) => {
    router.push({
      pathname: '/match-details',
      params: { id: matchId }
    });
  }, [router]);

  const handleProceed = useCallback(({ sport, type, note, preferences, buddies }) => {
    setShowCreateMatch(false);
    // Prepare buddy names or IDs to send
    const selectedBuddies = BUDDIES_DATA.filter(buddy => buddies.includes(buddy.id));

    // Navigate to venue-booking with the chosen parameters
    router.push({
      pathname: '/venue-booking',
      params: { 
        sport, 
        type,
        note: note || '',
        preferences: preferences.join(','), // You can parse this later
        buddies: selectedBuddies.map(b => b.name).join(','), // Sending buddy names
        fromSparring: true // Indicate the navigation source
      }
    });

    // Optional: Show an alert confirming the action
    Alert.alert(
      "Match Created",
      `Your match for ${sport} has been created with buddies: ${selectedBuddies.map(b => b.name).join(', ')}.\nPlease pick a location.`,
      [{ text: "OK" }]
    );
  }, []);

  // Function to handle friend click in Friends Nearby
  const handleFriendClick = (friend) => {
    // For example, show an alert with friend's name
    Alert.alert("Friend Selected", `You clicked on ${friend.name}.`, [{ text: "OK" }]);
  };

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
        <Text style={styles.headerTitle}>Play Together</Text>
        <TouchableOpacity style={styles.notifButton}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Create Match Button */}
        <TouchableOpacity
          style={styles.createMatchButton}
          onPress={() => setShowCreateMatch(true)}
        >
          <LinearGradient
            colors={[PRIMARY_GREEN, DARK_GREEN]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.createMatchGradient}
          >
            <View style={styles.createMatchContent}>
              <View>
                <Text style={styles.createMatchTitle}>
                  Create Match
                </Text>
                <Text style={styles.createMatchSubtitle}>
                  Play with friends or find new partners
                </Text>
              </View>
              <MaterialCommunityIcons 
                name="plus-circle" 
                size={32} 
                color="#fff" 
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Friends Quick Access */}
        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>Friends Nearby</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.friendsScroll}
          >
            {MOCK_FRIENDS.map(friend => (
              <TouchableOpacity 
                key={friend.id}
                style={styles.friendBubble}
                onPress={() => handleFriendClick(friend)} // Make friends clickable
              >
                <Image 
                  source={friend.avatar}
                  style={styles.friendBubbleAvatar}
                />
                <View style={styles.friendBubbleInfo}>
                  <Text style={styles.friendBubbleName}>{friend.name}</Text>
                  <Text style={styles.friendBubbleDetail}>
                    {friend.lastPlayed}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Matches */}
        <View style={styles.matchesSection}>
          <Text style={styles.sectionTitle}>Your Matches</Text>
          {MOCK_MATCHES.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              onPress={() => handleMatchPress(match.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Create Match Modal */}
      {showCreateMatch && (
        <CreateMatch 
          onClose={() => setShowCreateMatch(false)} 
          onProceed={handleProceed} 
        />
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
  notifButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  createMatchButton: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  createMatchGradient: {
    padding: 20,
  },
  createMatchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createMatchTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  createMatchSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  friendsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a472a',
    marginBottom: 12,
  },
  friendsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  friendBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  friendBubbleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendBubbleInfo: {
    flex: 1,
  },
  friendBubbleName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a472a',
    marginBottom: 2,
  },
  friendBubbleDetail: {
    fontSize: 12,
    color: '#666',
  },
  matchesSection: {
    marginBottom: 24,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchBadgeText: {
    color: PRIMARY_GREEN,
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#f44336',
    fontSize: 12,
    fontWeight: '500',
  },
  playersContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  playerInfo: {
    alignItems: 'center',
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a472a',
    marginBottom: 2,
  },
  playerLevel: {
    fontSize: 12,
    color: '#666',
  },
  matchDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  noteContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: PRIMARY_GREEN,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  fullScreenModal: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  modalContentFull: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    overflow: 'hidden'
  },
  modalHandleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a472a',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 16,
  },
  typeContainer: {
    gap: 12,
    marginBottom: 24,
  },
  typeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeCardSelected: {
    borderColor: PRIMARY_GREEN,
  },
  typeCardGradient: {
    padding: 16,
  },
  typeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a472a',
    marginTop: 8,
    marginBottom: 4,
  },
  typeCardTitleSelected: {
    color: '#fff',
  },
  typeCardDescription: {
    fontSize: 14,
    color: '#666',
  },
  typeCardDescriptionSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
  sportsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  sportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sportButtonSelected: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
  sportButtonText: {
    fontSize: 14,
    color: '#666',
  },
  sportButtonTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  noteInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  buddiesList: { // Updated style name
    marginBottom: 24,
  },
  buddyCard: { // Updated style name
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative', // For online indicator
    width: BUDDY_CARD_WIDTH, // Fixed width
    height: BUDDY_CARD_HEIGHT, // Fixed height
    justifyContent: 'center', // Center content vertically
  },
  buddyCardSelected: { // New style for selected buddies
    borderColor: PRIMARY_GREEN,
    borderWidth: 2,
  },
  buddyAvatar: { // Updated style name
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  buddyName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a472a',
    marginBottom: 4,
    textAlign: 'center',
  },
  buddyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buddySport: {
    fontSize: 12,
    color: '#666',
  },
  onlineIndicator: { // New style for online/offline status
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 10,
    right: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  preferenceButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  preferenceButtonSelected: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
  preferenceButtonText: {
    fontSize: 14,
    color: '#666',
  },
  preferenceButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  createButton: {
    backgroundColor: PRIMARY_GREEN,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});