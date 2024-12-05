// rental-confirmation.js
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
  Platform,
  Alert,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';

const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const LIGHT_GREEN = '#4caf50';

export default function RentalConfirmation() {
  const params = useLocalSearchParams();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate required params
  useEffect(() => {
    if (!params.equipmentId || !params.locationId) {
      Alert.alert(
        'Error',
        'Missing required information',
        [
          {
            text: 'Go Back',
            onPress: () => router.back()
          }
        ]
      );
    }
  }, [params]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/rental-success');
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm rental. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <Link href="/equipment" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.headerTitle}>Confirm Rental</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content} bounces={false}>
          {/* Equipment Info */}
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>{params.equipmentName}</Text>
            <Text style={styles.rentalDuration}>{params.duration} hour rental</Text>
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When do you want to pick up?</Text>
            
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
          </View>

          {/* Location Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{params.locationName}</Text>
                <Text style={styles.locationAddress}>{params.locationAddress}</Text>
                <View style={styles.locationDetails}>
                  <View style={styles.locationDetail}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.locationDetailText}>Open 07:00 - 23:00</Text>
                  </View>
                  <View style={styles.locationDetail}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={PRIMARY_GREEN} />
                    <Text style={styles.locationDetailText}>Selected Pickup Location</Text>
                  </View>
                </View>
              </View>
            </View>
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

          {/* Price Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Summary</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Rental Fee ({params.price} × {params.duration})</Text>
              <Text style={styles.priceValue}>¥{params.basePrice}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Fee</Text>
              <Text style={styles.priceValue}>¥{params.serviceFee}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Deposit (Refundable)</Text>
              <Text style={styles.priceValue}>¥{params.deposit}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>¥{params.total}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirm Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <LinearGradient
            colors={[PRIMARY_GREEN, DARK_GREEN]}
            style={styles.gradientButton}
          >
            <Text style={styles.confirmButtonText}>
              Confirm Pickup Details
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Loading Modal */}
      <Modal transparent visible={loading} animationType="fade">
        <BlurView intensity={80} style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_GREEN} />
            <Text style={styles.loadingText}>Confirming your rental...</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  equipmentInfo: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  equipmentName: {
    fontSize: 24,
    fontWeight: '700',
    color: DARK_GREEN,
  },
  rentalDuration: {
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
  locationCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: PRIMARY_GREEN,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  locationDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationDetailText: {
    fontSize: 14,
    color: '#666',
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