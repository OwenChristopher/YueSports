import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Dimensions, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FRAME_PREVIEWS = {
  Diamond: {
    title: "Supreme Champion",
    description: "Awarded to the elite top 10",
    borderColors: ['#3F51B5', '#9C27B0'],
    icon: "crown",
    glowColor: "rgba(63, 81, 181, 0.3)"
  },
  Platinum: {
    title: "Grand Master",
    description: "Prestigious top 50 title",
    borderColors: ['#9C27B0', '#673AB7'],
    icon: "trophy",
    glowColor: "rgba(156, 39, 176, 0.3)"
  },
  Gold: {
    title: "Elite Competitor",
    description: "Top 100 distinction",
    borderColors: ['#FFC107', '#FF9800'],
    icon: "medal",
    glowColor: "rgba(255, 193, 7, 0.3)"
  },
  Silver: {
    title: "Rising Star",
    description: "Top 500 achievement",
    borderColors: ['#9E9E9E', '#757575'],
    icon: "star",
    glowColor: "rgba(158, 158, 158, 0.3)"
  },
  Bronze: {
    title: "Aspiring Champion",
    description: "Top 1000 recognition",
    borderColors: ['#795548', '#5D4037'],
    icon: "shield",
    glowColor: "rgba(121, 85, 72, 0.3)"
  }
};

const ProfileFramePreview = ({ tier }) => {
  const framePreview = FRAME_PREVIEWS[tier];
  const [rotation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  const rotateStyle = {
    transform: [{
      rotate: rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
      })
    }]
  };

  return (
    <View style={[styles.framePreview, { shadowColor: framePreview.glowColor }]}>
      <LinearGradient
        colors={framePreview.borderColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.frameBorder}
      >
        <BlurView intensity={80} style={styles.frameContent}>
          <Animated.View style={[styles.frameIconContainer, rotateStyle]}>
            <MaterialCommunityIcons 
              name={framePreview.icon} 
              size={32} 
              color={framePreview.borderColors[0]} 
            />
          </Animated.View>
          <Text style={styles.frameTitle}>{framePreview.title}</Text>
          <Text style={styles.frameDescription}>{framePreview.description}</Text>
        </BlurView>
      </LinearGradient>
    </View>
  );
};

const RewardsModal = ({ season, visible, onClose }) => {
  const tiers = [
    {
      name: "Diamond",
      icon: "👑",
      color: "#3F51B5",
      rewards: [
        "Champion Trophy & Badge",
        "Limited Edition Profile Frame",
        "1,000 Premium Points",
        "Exclusive Equipment Voucher"
      ],
      requirements: "Top 10 Players"
    },
    {
      name: "Platinum",
      icon: "🏆",
      color: "#9C27B0",
      rewards: [
        "Platinum Trophy",
        "500 Premium Points",
        "Special Profile Badge",
        "Premium Voucher"
      ],
      requirements: "Top 50 Players"
    },
    {
      name: "Gold",
      icon: "🥇",
      color: "#FFC107",
      rewards: [
        "Gold Trophy",
        "250 Premium Points",
        "Gold Badge",
        "Sport Voucher"
      ],
      requirements: "Top 100 Players"
    },
    {
      name: "Silver",
      icon: "🥈",
      color: "#9E9E9E",
      rewards: [
        "Silver Trophy",
        "100 Premium Points",
        "Silver Badge"
      ],
      requirements: "Top 500 Players"
    },
    {
      name: "Bronze",
      icon: "🥉",
      color: "#795548",
      rewards: [
        "Bronze Trophy",
        "50 Premium Points",
        "Bronze Badge"
      ],
      requirements: "Top 1000 Players"
    }
  ];

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(season.endDate) - new Date()) / (1000 * 60 * 60 * 24))
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={80} style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#1a472a', '#2e7d32']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.header}
          >
            <View>
              <Text style={styles.headerTitle}>{season.name} Rewards</Text>
              <Text style={styles.headerSubtitle}>{daysLeft} days remaining</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.scrollContainer}>
            {tiers.map((tier, index) => (
              <View key={tier.name} style={styles.tierContainer}>
                {index !== tiers.length - 1 && (
                  <View style={styles.connectorLine} />
                )}
                
                {/* Profile Frame Preview for top tiers */}
                {(tier.name === "Diamond" || tier.name === "Platinum") && (
                  <ProfileFramePreview tier={tier.name} />
                )}

                <View style={styles.tierRow}>
                  <LinearGradient
                    colors={[tier.color, tier.color + '80']}
                    style={styles.iconContainer}
                  >
                    <Text style={styles.iconText}>{tier.icon}</Text>
                  </LinearGradient>
                  
                  <View style={styles.tierInfo}>
                    <View style={styles.tierHeader}>
                      <Text style={[styles.tierName, { color: tier.color }]}>
                        {tier.name}
                      </Text>
                      <View style={[styles.requirementsBadge, { backgroundColor: tier.color + '20' }]}>
                        <Text style={[styles.tierRequirements, { color: tier.color }]}>
                          {tier.requirements}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.rewardsBox}>
                      {tier.rewards.map((reward, i) => (
                        <View key={i} style={styles.rewardItem}>
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={16}
                            color={tier.color}
                            style={styles.checkIcon}
                          />
                          <Text style={styles.rewardText}>{reward}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <LinearGradient
            colors={['rgba(255,255,255,0.9)', '#fff']}
            style={styles.footer}
          >
            <MaterialCommunityIcons name="trophy-award" size={24} color="#2e7d32" />
            <Text style={styles.footerText}>
              Keep playing to unlock exclusive rewards and recognition!
            </Text>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden'
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20
  },
  scrollContainer: {
    padding: 20
  },
  tierContainer: {
    marginBottom: 32,
    position: 'relative'
  },
  connectorLine: {
    position: 'absolute',
    left: 32,
    top: 70,
    bottom: -20,
    width: 2,
    backgroundColor: '#f0f0f0'
  },
  framePreview: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12
  },
  frameBorder: {
    padding: 2,
    borderRadius: 16
  },
  frameContent: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center'
  },
  frameIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  frameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4
  },
  frameDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 8
  },
  iconText: {
    fontSize: 28
  },
  tierInfo: {
    flex: 1
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8
  },
  tierName: {
    fontSize: 20,
    fontWeight: '700'
  },
  requirementsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  tierRequirements: {
    fontSize: 12,
    fontWeight: '600'
  },
  rewardsBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    gap: 12
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  rewardText: {
    fontSize: 14,
    color: '#444',
    flex: 1
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    flex: 1
  }
});

export default RewardsModal;