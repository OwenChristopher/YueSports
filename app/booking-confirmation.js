// app/booking-confirmation.js
import React, { useState, useRef, useEffect } from 'react';
import { useLocalSearchParams, Link, router } from 'expo-router';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  Switch,
  Image,
  Alert,
  KeyboardAvoidingView,
  Modal
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';

const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const LIGHT_GREEN = '#4caf50';

export default function BookingConfirmation() {
  const { venueId, sport, venueName, price } = useLocalSearchParams();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('20:00');
  const [duration, setDuration] = useState(2);
  const [players, setPlayers] = useState(2);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  // Animation values
  const publicPrivateAnim = useRef(new Animated.Value(0)).current;
  const paymentSlideAnim = useRef(new Animated.Value(400)).current;
  const shareSlideAnim = useRef(new Animated.Value(400)).current;
  const loadingSpinValue = useRef(new Animated.Value(0)).current;

  const paymentMethods = [
    { id: 'alipay', name: 'Alipay', icon: 'alipay', color: '#1677FF' },
    { id: 'wechat', name: 'WeChat Pay', icon: 'wechat', color: '#07C160' },
    { id: 'card', name: 'Credit Card', icon: 'credit-card', color: '#666' },
    { id: 'apple', name: 'Apple Pay', icon: 'apple', color: '#000' }
  ];

  const shareOptions = [
    { id: 'wechat', name: 'WeChat', icon: 'wechat', color: '#07C160' },
    { id: 'moments', name: 'Moments', icon: 'camera', color: '#1677FF' },
    { id: 'copy', name: 'Copy Link', icon: 'link', color: '#666' }
  ];

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(loadingSpinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ).start();
    }
  }, [loading]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const togglePublicPrivate = () => {
    Animated.spring(publicPrivateAnim, {
      toValue: isPublic ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
    setIsPublic(!isPublic);
  };

  const showPaymentSheet = () => {
    // Validate all required fields first
    if (!validateBooking()) {
      return;
    }
    
    setShowPaymentOptions(true);
    Animated.spring(paymentSlideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
  };

  const validateBooking = () => {
    if (!date) {
      Alert.alert('Missing Information', 'Please select a date');
      return false;
    }
    if (!time) {
      Alert.alert('Missing Information', 'Please select a time');
      return false;
    }
    if (duration < 1) {
      Alert.alert('Invalid Duration', 'Duration must be at least 1 hour');
      return false;
    }
    return true;
  };

  const hidePaymentSheet = () => {
    Animated.spring(paymentSlideAnim, {
      toValue: 400,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start(() => setShowPaymentOptions(false));
  };

  const showShareSheet = () => {
    setShowShareOptions(true);
    Animated.spring(shareSlideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
  };

  const hideShareSheet = () => {
    Animated.spring(shareSlideAnim, {
      toValue: 400,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start(() => setShowShareOptions(false));
  };

  const handlePayment = async (method) => {
    setSelectedPayment(method);
    hidePaymentSheet();
    setLoading(true);

    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoading(false);
      showShareSheet();
    } catch (error) {
      setLoading(false);
      Alert.alert('Payment Failed', 'Please try again');
    }
  };

  const handleShare = async (option) => {
    try {
      hideShareSheet();
      setLoading(true);
      // Simulate sharing
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
      router.push('/booking-success');
    } catch (error) {
      setLoading(false);
      Alert.alert('Sharing Failed', 'Please try again');
    }
  };

  const calculateTotalCost = () => {
    const hourlyRate = parseInt(price?.replace('¥', '') || '0');
    return hourlyRate * duration;
  };

  const handleInviteFriends = () => {
    router.push('/invite-friends');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[DARK_GREEN, PRIMARY_GREEN]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}
      >
        <Link href="/venue-booking" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content} bounces={false}>
          {/* Venue Info */}
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{venueName}</Text>
            <Text style={styles.sportType}>{sport}</Text>
          </View>

          {/* Date & Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When do you want to play?</Text>
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={24} color={PRIMARY_GREEN} />
              <Text style={styles.dateText}>
                {date.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}

            <View style={styles.timeContainer}>
              <View style={styles.timeSlot}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <View style={styles.timeInputContainer}>
                  <TextInput
                    style={styles.timeInput}
                    value={time}
                    onChangeText={setTime}
                    placeholder="20:00"
                    keyboardType="numbers-and-punctuation"
                  />
                  <Ionicons name="time-outline" size={20} color="#666" />
                </View>
              </View>
              <View style={styles.timeSlot}>
                <Text style={styles.timeLabel}>Duration (hours)</Text>
                <View style={styles.durationControl}>
                  <TouchableOpacity
                    onPress={() => duration > 1 && setDuration(duration - 1)}
                    style={styles.durationButton}
                  >
                    <Text style={styles.durationButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.durationText}>{duration}</Text>
                  <TouchableOpacity 
                    onPress={() => duration < 8 && setDuration(duration + 1)}
                    style={styles.durationButton}
                  >
                    <Text style={styles.durationButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Booking Type Toggle */}
          <View style={styles.section}>
            <View style={styles.toggleHeader}>
              <Text style={styles.sectionTitle}>Booking Type</Text>
              <TouchableOpacity 
                style={styles.toggleContainer} 
                onPress={togglePublicPrivate}
                activeOpacity={0.8}
              >
                <Animated.View style={[
                  styles.toggleSlider,
                  {
                    transform: [{
                      translateX: publicPrivateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2, 28]
                      })
                    }]
                  }
                ]} />
                <View style={styles.toggleTextContainer}>
                  <Text style={[
                    styles.toggleText,
                    !isPublic && styles.toggleTextActive
                  ]}>Private</Text>
                  <Text style={[
                    styles.toggleText,
                    isPublic && styles.toggleTextActive
                  ]}>Community</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.toggleDescription}>
              {isPublic 
                ? "Others can join your session and split the cost"
                : "Only invited friends can join your session"
              }
            </Text>

            {!isPublic && (
              <TouchableOpacity 
                style={styles.inviteFriendsButton}
                onPress={handleInviteFriends}
              >
                <Ionicons name="person-add" size={20} color={PRIMARY_GREEN} />
                <Text style={styles.inviteFriendsText}>Invite Friends</Text>
                {invitedFriends.length > 0 && (
                  <View style={styles.invitedBadge}>
                    <Text style={styles.invitedBadgeText}>{invitedFriends.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Special Requests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
            <TextInput
              style={styles.specialRequestsInput}
              value={specialRequests}
              onChangeText={setSpecialRequests}
              placeholder="Any special requirements?"
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          {/* Price Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Breakdown</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Court Fee ({price} × {duration} hours)</Text>
              <Text style={styles.priceValue}>¥{calculateTotalCost()}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Fee</Text>
              <Text style={styles.priceValue}>¥5</Text>
            </View>
            {isPublic && (
              <View style={styles.priceNote}>
                <Ionicons name="information-circle-outline" size={16} color="#666" />
                <Text style={styles.priceNoteText}>
                  Final cost may be lower depending on number of participants
                </Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>¥{calculateTotalCost() + 5}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Confirm Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={showPaymentSheet}
        >
          <LinearGradient
            colors={[PRIMARY_GREEN, DARK_GREEN]}
            style={styles.gradientButton}
          >
            <Text style={styles.confirmButtonText}>
              Confirm Booking • ¥{calculateTotalCost() + 5}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Payment Sheet */}
      {showPaymentOptions && (
        <BlurView intensity={80} style={styles.overlay}>
          <Animated.View 
            style={[
              styles.paymentSheet,
              {
                transform: [{ translateY: paymentSlideAnim }]
              }
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Payment Method</Text>
              <TouchableOpacity onPress={hidePaymentSheet}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.paymentMethod}
                onPress={() => handlePayment(method)}
              >
                <View style={[styles.paymentIcon, { backgroundColor: method.color + '20' }]}>
                  <FontAwesome5 name={method.icon} size={24} color={method.color} />
                </View>
                <Text style={styles.paymentMethodText}>{method.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </BlurView>
      )}

      {/* Share Sheet */}
      {showShareOptions && (
        <BlurView intensity={80} style={styles.overlay}>
          <Animated.View 
            style={[
              styles.shareSheet,
              {
                transform: [{ translateY: shareSlideAnim }]
              }
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Share Booking</Text>
              <TouchableOpacity onPress={hideShareSheet}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.shareDescription}>
              Share your booking with friends or on social media
            </Text>
            <View style={styles.shareOptions}>
              {shareOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.shareOption}
                  onPress={() => handleShare(option)}
                >
                  <View style={[styles.shareIcon, { backgroundColor: option.color + '20' }]}>
                    <FontAwesome5 name={option.icon} size={24} color={option.color} />
                  </View>
                  <Text style={styles.shareOptionText}>{option.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </BlurView>
      )}

      {/* Loading Modal */}
      <Modal transparent visible={loading} animationType="fade">
        <BlurView intensity={80} style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <Animated.View style={{
              transform: [{
                rotate: loadingSpinValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }]
            }}>
              <MaterialCommunityIcons name="loading" size={48} color={PRIMARY_GREEN} />
            </Animated.View>
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 40 : 12,
  },
  backButton: {
    // Add styles for back button if needed
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  venueInfo: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  venueName: {
    fontSize: 24,
    fontWeight: '700',
    color: DARK_GREEN,
  },
  sportType: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: PRIMARY_GREEN,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  timeSlot: {
    flex: 1,
  },
  timeLabel: {
    marginBottom: 8,
    color: '#666',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  timeInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  durationControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  durationButton: {
    padding: 12,
    backgroundColor: '#e0e0e0',
  },
  durationButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIMARY_GREEN,
  },
  durationText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleContainer: {
    width: 80,
    height: 32,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleSlider: {
    position: 'absolute',
    width: 28,
    height: 28,
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  toggleText: {
    fontSize: 12,
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inviteFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
  },
  inviteFriendsText: {
    flex: 1,
    color: PRIMARY_GREEN,
    fontWeight: '500',
  },
  invitedBadge: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  invitedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  specialRequestsInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    color: '#666',
  },
  priceValue: {
    fontWeight: '500',
  },
  priceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  priceNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: PRIMARY_GREEN,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  paymentSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  shareSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DARK_GREEN,
  },
  shareDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  shareOption: {
    alignItems: 'center',
    gap: 8,
  },
  shareIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareOptionText: {
    fontSize: 14,
    color: '#666',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: PRIMARY_GREEN,
    fontWeight: '500',
  },
});
