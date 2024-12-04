// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for Competition"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBadge}>
            <MaterialCommunityIcons name="dice-multiple" size={24} color="#000" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>4</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Button */}
      <TouchableOpacity style={styles.locationButton}>
        <Ionicons name="location-outline" size={24} color="#000" />
        <Text style={styles.locationText}>All Location</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Cards */}
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardIconContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={24} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Venue Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={styles.cardIconContainer}>
              <MaterialCommunityIcons name="account-group" size={24} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Open Play</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: 'account-group', text: 'Community' },
            { icon: 'timer', text: 'Sparring' },
            { icon: 'medal', text: 'Leaderboard' },
            { icon: 'trophy', text: 'Competition' }
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#8B0000" />
              </View>
              <Text style={styles.actionText}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Buddies Section */}
        <View style={styles.buddiesSection}>
          <View style={styles.buddiesHeader}>
            <Text style={styles.buddiesTitle}>Find buddies to play with? Sure!</Text>
            <TouchableOpacity>
              <Ionicons name="arrow-forward" size={24} color="#8B0000" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.eventScroll}
          >
            <TouchableOpacity style={styles.eventCard}>
              <Text style={styles.eventTitle}>NETizens Mabar eps. 2 [💸 45k]</Text>
              <View style={styles.eventDetails}>
                <MaterialCommunityIcons name="badminton" size={16} color="#666" />
                <Text style={styles.eventText}>Badminton · Newbie - Intermediate</Text>
              </View>
              <View style={styles.eventDetails}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.eventText}>Sen, 02 Des 2024, 20:00 - 22:00</Text>
              </View>
              <View style={styles.eventDetails}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.eventText}>Pasar Tebet Barat Sport Center, Kota</Text>
              </View>
              <View style={styles.bookedTag}>
                <Text style={styles.bookedText}>Booked via AYO</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'home', text: 'Home', active: true },
          { icon: 'view-dashboard-outline', text: 'Dashboard' },
          { icon: 'compass', text: 'Explore' },
          { icon: 'chat-outline', text: 'Chat' },
          { icon: 'account-outline', text: 'Profile' }
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.navItem}>
            <MaterialCommunityIcons 
              name={item.icon} 
              size={24} 
              color={item.active ? '#8B0000' : '#666'} 
            />
            <Text style={[styles.navText, item.active && styles.activeNavText]}>
              {item.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#8B0000',
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
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  cardContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIconContainer: {
    backgroundColor: '#8B0000',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
  },
  buddiesSection: {
    padding: 16,
  },
  buddiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buddiesTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  eventScroll: {
    marginHorizontal: -16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginLeft: 16,
    width: 300,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  eventText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  bookedTag: {
    backgroundColor: '#e6ffe6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  bookedText: {
    color: '#008000',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  activeNavText: {
    color: '#8B0000',
  },
});