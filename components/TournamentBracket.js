import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import { X } from 'lucide-react-native';

const TournamentBracket = ({ onClose }) => {
  const [matches, setMatches] = useState({
    quarterFinals: [
      {
        id: 1,
        time: '10:00 AM',
        isLive: false,
        teams: [
          { seed: 1, name: 'Team A', score: 80, isWinner: true },
          { seed: 8, name: 'Team B', score: 75 }
        ]
      },
      {
        id: 2,
        time: '11:30 AM',
        isLive: true,
        teams: [
          { seed: 4, name: 'Team C', score: 70 },
          { seed: 5, name: 'Team D', score: 85, isWinner: true }
        ]
      },
      {
        id: 3,
        time: '2:00 PM',
        teams: [
          { seed: 3, name: 'Team E', score: 92, isWinner: true },
          { seed: 6, name: 'Team F', score: 88 }
        ]
      },
      {
        id: 4,
        time: '3:30 PM',
        teams: [
          { seed: 2, name: 'Team G', score: 95, isWinner: true },
          { seed: 7, name: 'Team H', score: 82 }
        ]
      }
    ],
    semiFinals: [
      {
        id: 5,
        time: '6:00 PM',
        teams: [
          { seed: 1, name: 'Team A', score: 88, isWinner: true },
          { seed: 5, name: 'Team D', score: 82 }
        ]
      },
      {
        id: 6,
        time: '7:30 PM',
        teams: [
          { seed: 3, name: 'Team E', score: 78 },
          { seed: 2, name: 'Team G', score: 85, isWinner: true }
        ]
      }
    ],
    finals: [
      {
        id: 7,
        time: '8:00 PM',
        teams: [
          { seed: 1, name: 'Team A' },
          { seed: 2, name: 'Team G' }
        ]
      }
    ]
  });

  const LiveIndicator = () => {
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(pulse).start();
    }, []);

    return (
      <View style={styles.liveContainer}>
        <Animated.View
          style={[
            styles.liveDot,
            {
              opacity: pulseAnim,
            },
          ]}
        />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    );
  };

  const MatchCard = ({ match, roundIndex }) => (
    <View style={[
      styles.matchCard,
      roundIndex === 1 ? { marginTop: 32 } : roundIndex === 2 ? { marginTop: 64 } : {}
    ]}>
      <View style={styles.matchHeader}>
        <Text style={styles.timeText}>{match.time}</Text>
        {match.isLive && <LiveIndicator />}
      </View>
      
      {match.teams.map((team, idx) => (
        <View
          key={idx}
          style={[
            styles.teamContainer,
            idx === 0 && styles.teamBorder,
            team.isWinner && styles.winnerBackground
          ]}
        >
          <View style={styles.teamInfo}>
            <View style={[
              styles.seedContainer,
              team.seed <= 4 ? styles.topSeed : styles.lowerSeed
            ]}>
              <Text style={[
                styles.seedText,
                team.seed <= 4 ? styles.topSeedText : styles.lowerSeedText
              ]}>
                {team.seed}
              </Text>
            </View>
            <Text style={styles.teamName}>{team.name}</Text>
          </View>
          <Text style={styles.scoreText}>{team.score || '-'}</Text>
        </View>
      ))}
    </View>
  );

  const RoundSection = ({ title, matches, roundIndex }) => (
    <View style={styles.roundSection}>
      <View style={styles.roundHeaderContainer}>
        <Text style={styles.roundTitle}>{title}</Text>
        <View style={styles.roundLine} />
      </View>
      <View style={styles.matchesContainer}>
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} roundIndex={roundIndex} />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tournament Bracket</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal={true}
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.bracketContainer}>
          <RoundSection 
            title="Quarter Finals" 
            matches={matches.quarterFinals} 
            roundIndex={0} 
          />
          <RoundSection 
            title="Semi Finals" 
            matches={matches.semiFinals} 
            roundIndex={1} 
          />
          <RoundSection 
            title="Finals" 
            matches={matches.finals} 
            roundIndex={2} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  bracketContainer: {
    flexDirection: 'row',
    gap: 24,
    minWidth: Dimensions.get('window').width,
    paddingBottom: 16,
  },
  roundSection: {
    flex: 1,
    minWidth: 280,
  },
  roundHeaderContainer: {
    marginBottom: 16,
  },
  roundTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  roundLine: {
    height: 3,
    backgroundColor: '#e2e8f0',
    width: '100%',
    borderRadius: 1.5,
  },
  matchesContainer: {
    gap: 16,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  timeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fecaca',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    backgroundColor: '#dc2626',
    borderRadius: 3,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  teamContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  teamBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  winnerBackground: {
    backgroundColor: '#f0fdf4',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  seedContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSeed: {
    backgroundColor: '#fff7ed',
  },
  lowerSeed: {
    backgroundColor: '#f8fafc',
  },
  seedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  topSeedText: {
    color: '#ea580c',
  },
  lowerSeedText: {
    color: '#64748b',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
});

export default TournamentBracket;