// app/competitions.js
import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
  StatusBar,
  Modal,
  Dimensions
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import TournamentBracket from '../components/TournamentBracket'; // Assuming same directory

const SCREEN_WIDTH = Dimensions.get('window').width;
const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const LIGHT_GREEN = '#4caf50';

const COMPETITIONS_DATA = {
  recommended: [
    {
      id: 1,
      title: 'XJTLU Sports Festival',
      sport: 'Basketball',
      location: 'XJTLU Sports Centre',
      date: '29 June 2024',
      type: 'league',
      image: require('../assets/competitions/festival.jpg'),
      registrationClosed: true,
      prize: {
        first: '¥4,000 + Trophy',
        second: '¥2,000 + Medal',
        third: '¥1,000 + Medal'
      },
      entryFee: '¥500/team',
      sponsor: 'XJTLU Sports Department',
      details: 'Inter-university basketball tournament hosted by XJTLU'
    },
    {
      id: 2,
      title: 'Taicang Cup',
      sport: 'Football',
      location: 'Taicang Sports Complex',
      date: '27 July 2024',
      type: 'knockout',
      image: require('../assets/competitions/cup.jpg'),
      registrationClosed: false,
      prize: {
        first: '¥3,500 + Trophy',
        second: '¥2,000 + Medal',
        third: '¥1,000 + Medal'
      },
      entryFee: '¥450/team',
      sponsor: 'Taicang Sports Authority',
      details: 'Annual football championship for local teams'
    },
    {
      id: 3,
      title: 'University League',
      sport: 'Badminton',
      location: 'XJTLU Sports Centre',
      date: '15 August 2024',
      type: 'league',
      image: require('../assets/competitions/league.jpg'),
      registrationClosed: false,
      prize: {
        first: '¥3,000 + Trophy',
        second: '¥1,500 + Medal',
        third: '¥800 + Medal'
      },
      entryFee: '¥300/person',
      sponsor: 'University Sports Association',
      details: 'Inter-university badminton league'
    }
  ],
  ongoing: [
    {
      id: 4,
      title: 'Summer Championship',
      sport: 'Basketball',
      location: 'Taicang Sports Complex',
      progress: '75%',
      remainingTeams: 8,
      totalTeams: 32,
      currentRound: 'Quarter Finals',
      sponsor: 'Taicang Municipal Government'
    },
    {
      id: 5,
      title: 'XJTLU Internal League',
      sport: 'Badminton',
      location: 'XJTLU Sports Centre',
      progress: '50%',
      remainingTeams: 16,
      totalTeams: 32,
      currentRound: 'Round of 16',
      sponsor: 'XJTLU Sports Club'
    }
  ]
};

const SPORT_CATEGORIES = [
  { id: 'basketball', name: 'Basketball', icon: 'basketball' },
  { id: 'badminton', name: 'Badminton', icon: 'badminton' },
  { id: 'tennis', name: 'Tennis', icon: 'tennis' },
  { id: 'volleyball', name: 'Volleyball', icon: 'volleyball' }
];

const PremiumModal = React.memo(({ visible, onClose, onUpgrade }) => {
  const benefits = [
    {
      icon: 'trophy',
      title: 'Create Competitions',
      description: 'Host and manage your own tournaments'
    },
    {
      icon: 'medal',
      title: 'Premium Features',
      description: 'Access advanced tournament management tools'
    },
    {
      icon: 'chart-line',
      title: 'Analytics',
      description: 'Get detailed insights and statistics'
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
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
              Create and manage your own competitions
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

const CompetitionCard = React.memo(({ competition, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.competitionCard}
      onPress={() => onPress(competition)}
    >
      <ImageBackground
        source={competition.image}
        style={styles.cardBackground}
        imageStyle={styles.cardBackgroundImage}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        >
          {competition.registrationClosed && (
            <View style={styles.registrationClosedBadge}>
              <Text style={styles.registrationClosedText}>
                Registration Closed
              </Text>
            </View>
          )}
          
          <View style={styles.cardContent}>
            <Text style={styles.competitionTitle}>{competition.title}</Text>
            <View style={styles.competitionDetails}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons 
                  name="map-marker" 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.detailText}>{competition.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.detailText}>{competition.date}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons 
                  name={competition.sport.toLowerCase()} 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.detailText}>{competition.sport}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
});

const OngoingCompetitionCard = React.memo(({ competition, onViewBracketPress }) => {
  return (
    <View style={styles.ongoingCard}>
      <View style={styles.ongoingHeader}>
        <Text style={styles.ongoingTitle}>{competition.title}</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{competition.progress}</Text>
        </View>
      </View>
      
      <View style={styles.ongoingDetails}>
        <View style={styles.ongoingDetailItem}>
          <MaterialCommunityIcons 
            name={competition.sport.toLowerCase()} 
            size={20} 
            color={PRIMARY_GREEN} 
          />
          <Text style={styles.ongoingDetailText}>{competition.sport}</Text>
        </View>
        <View style={styles.ongoingDetailItem}>
          <MaterialCommunityIcons 
            name="map-marker" 
            size={20} 
            color={PRIMARY_GREEN} 
          />
          <Text style={styles.ongoingDetailText}>{competition.location}</Text>
        </View>
      </View>

      <View style={styles.tournamentProgress}>
        <Text style={styles.roundText}>
          {competition.currentRound} • {competition.remainingTeams}/{competition.totalTeams} teams remaining
        </Text>
        <TouchableOpacity style={styles.viewBracketButton} onPress={onViewBracketPress}>
          <Text style={styles.viewBracketText}>View Bracket</Text>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={20} 
            color={PRIMARY_GREEN} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function Competitions() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(SPORT_CATEGORIES[0].id);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showBracket, setShowBracket] = useState(false);

  const handleCompetitionPress = useCallback((competition) => {
    router.push({
      pathname: '/competition-details',
      params: { id: competition.id }
    });
  }, [router]);

  const handleCreateCompetition = useCallback(() => {
    setShowPremiumModal(true);
  }, []);

  const handleUpgrade = useCallback(() => {
    setShowPremiumModal(false);
    router.push('/subscription');
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
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Competition</Text>
          <Text style={styles.headerSubtitle}>
            Get in the game! Feel the competitive vibe!
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Action Cards */}
        <View style={styles.actionCards}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#FFD700' }]}
            onPress={() => router.push('/find-competition')}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>FIND</Text>
              <Text style={styles.actionSubtitle}>COMPETITION</Text>
            </View>
            <MaterialCommunityIcons 
              name="arrow-right" 
              size={24} 
              color="#000" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#008080' }]}
            onPress={handleCreateCompetition}
          >
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: '#fff' }]}>Manage</Text>
              <Text style={[styles.actionSubtitle, { color: '#fff' }]}>
                Competition
              </Text>
            </View>
            <MaterialCommunityIcons 
              name="arrow-right" 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>

        {/* Sport Categories */}
        <Text style={styles.sectionTitle}>Recommended competitions for you</Text>
        <Text style={styles.sectionSubtitleSmall}>
          Explore a variety of exciting competitions
        </Text>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {SPORT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <MaterialCommunityIcons
                name={category.icon}
                size={20}
                color={selectedCategory === category.id ? '#fff' : '#000'}
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommended Competitions */}
        <View style={styles.competitionsList}>
          {COMPETITIONS_DATA.recommended.map((competition) => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              onPress={handleCompetitionPress}
            />
          ))}
        </View>

        {/* Ongoing Competitions */}
        <View style={styles.ongoingSection}>
          <Text style={styles.sectionTitle}>Ongoing competitions</Text>
          {COMPETITIONS_DATA.ongoing.map((competition) => (
            <OngoingCompetitionCard
              key={competition.id}
              competition={competition}
              onViewBracketPress={() => setShowBracket(true)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgrade}
      />

      {/* Bracket Modal */}
      <Modal
        visible={showBracket}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowBracket(false)}
      >
        <TournamentBracket onClose={() => setShowBracket(false)} />
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTextContainer: {
    marginLeft: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff'
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  actionCards: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#000',
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK_GREEN,
    marginBottom: 4,
    textAlign: 'left',
  },
  sectionSubtitleSmall: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'left',
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f3f5',
    borderRadius: 20,
    marginRight: 8,
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: PRIMARY_GREEN,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  competitionsList: {
    gap: 16,
    marginBottom: 24,
  },
  competitionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
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
  cardBackground: {
    flex: 1,
  },
  cardBackgroundImage: {
    borderRadius: 16,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  registrationClosedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  registrationClosedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    gap: 8,
  },
  competitionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  competitionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
  },
  ongoingSection: {
    marginBottom: 24,
  },
  ongoingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
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
  ongoingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ongoingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
  },
  progressBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    color: PRIMARY_GREEN,
    fontSize: 12,
    fontWeight: '600',
  },
  ongoingDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  ongoingDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ongoingDetailText: {
    color: '#666',
    fontSize: 14,
  },
  tournamentProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  roundText: {
    color: '#666',
    fontSize: 14,
  },
  viewBracketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewBracketText: {
    color: PRIMARY_GREEN,
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
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
    color: DARK_GREEN,
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
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
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
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});
