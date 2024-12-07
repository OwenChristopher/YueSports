import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { BlurView } from 'expo-blur';
import { PieChart as RNCKPieChart, BarChart as RNCKBarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
const PRIMARY_GREEN = '#2e7d32';

const StatBox = ({ label, value, isBlurred = false }) => (
  <View className="flex-1 bg-white rounded-lg p-4 relative overflow-hidden">
    {isBlurred && (
      <BlurView intensity={30} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 8 }} />
    )}
    <Text style={{ fontSize: 14, color: '#666', marginBottom: 4, opacity: isBlurred ? 0.5 : 1 }}>
      {label}
    </Text>
    <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', opacity: isBlurred ? 0.5 : 1 }}>
      {value}
    </Text>
  </View>
);

const ProfileStatistics = ({ 
  statistics, 
  canViewDetailedStats, 
  onUnlockPress 
}) => {
  const totalMatches = statistics.totalMatches;
  const totalWins = statistics.totalWins;
  const totalLost = totalMatches - totalWins;
  const mostPlayedWith = "Sarah Chen"; // Placeholder
  
  const matchData = [
    { name: 'Won', value: totalWins, color: '#4CAF50', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Lost', value: totalLost, color: '#f44336', legendFontColor: '#333', legendFontSize: 12 }
  ];

  const performanceData = [
    { name: 'Rating', value: statistics.averageRating },
    { name: 'Streak', value: statistics.longestStreak * 100 },
    { name: 'Spirit', value: statistics.sportingSpirit * 100 }
  ];

  return (
    <View style={{ marginTop: 0 }}>
      {/* Base Stats - Always visible */}
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
        <StatBox label="Matches Played" value={totalMatches} />
        <StatBox label="Matches Won" value={totalWins} />
      </View>

      {/* Advanced Statistics Section */}
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden' }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>
          Advanced Statistics
        </Text>

        {/* Win/Loss Distribution */}
        <View style={{ backgroundColor: '#f9f9f9', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 }}>
            Win/Loss Distribution
          </Text>
          <View style={{ alignItems: 'center' }}>
            <RNCKPieChart
              data={matchData}
              width={screenWidth - 64} // Adjusted to account for padding
              height={180}
              chartConfig={{
                backgroundColor: '#fff',
                color: () => `rgba(0,0,0,0.7)`,
                labelColor: () => '#333'
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={{ backgroundColor: '#f9f9f9', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 }}>
            Performance Metrics
          </Text>
          <RNCKBarChart
            data={{
              labels: performanceData.map(d => d.name),
              datasets: [{ data: performanceData.map(d => d.value) }]
            }}
            width={screenWidth - 64}
            height={200}
            fromZero
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
              labelColor: () => '#333',
              propsForHorizontalLabels: { fontSize: 10 },
            }}
            style={{ borderRadius: 12 }}
          />
        </View>

        {/* Additional Stats */}
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <StatBox label="Most Played With" value={mostPlayedWith} isBlurred={!canViewDetailedStats} />
          <StatBox label="Avg. Match Duration" value="45 mins" isBlurred={!canViewDetailedStats} />
        </View>

        {/* If user can't view details, blur the advanced section and show unlock button */}
        {!canViewDetailedStats && (
          <>
            <BlurView
              intensity={30}
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                borderRadius: 12,
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 20
              }}
            />
            <TouchableOpacity
              onPress={onUnlockPress}
              style={{
                position: 'absolute',
                bottom: 20,
                alignSelf: 'center',
                backgroundColor: '#e8f5e9',
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16
              }}
            >
              <MaterialCommunityIcons name="lock" size={20} color={PRIMARY_GREEN} />
              <Text style={{ marginLeft: 8, fontWeight: '600', color: PRIMARY_GREEN }}>
                Unlock Detailed Statistics
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default ProfileStatistics;
