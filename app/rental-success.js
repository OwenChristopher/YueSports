import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';

const RentalSuccess = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <MaterialCommunityIcons name="check-circle" size={80} color={PRIMARY_GREEN} />
        </View>
        
        <Text style={styles.title}>Rental Confirmed!</Text>
        <Text style={styles.message}>
          Your equipment rental has been confirmed. Please pick up your equipment at the selected location during the chosen time slot.
        </Text>
        
        <View style={styles.reminderCard}>
          <MaterialCommunityIcons name="information" size={24} color={PRIMARY_GREEN} />
          <Text style={styles.reminderText}>
            Don't forget to bring your ID and the payment method used for the deposit.
          </Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <Link href="/equipment" asChild>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Rent More Equipment</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <LinearGradient
              colors={[PRIMARY_GREEN, DARK_GREEN]}
              style={styles.gradientButton}
            >
              <Text style={styles.primaryButtonText}>Back to Home</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: DARK_GREEN,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  reminderText: {
    flex: 1,
    fontSize: 14,
    color: PRIMARY_GREEN,
    lineHeight: 20,
  },
  buttonsContainer: {
    padding: 24,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: PRIMARY_GREEN,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RentalSuccess;