// app/equipment.js
import React, { useState, useCallback, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
  Modal,
  Dimensions,
  Animated,
  Alert
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const LIGHT_GREEN = '#4caf50';

const PICKUP_LOCATIONS = [
  {
    id: 'tc',
    name: "Taicang Sports Complex",
    address: "123 Taicang Road, Downtown Taicang",
    hours: "07:00 - 23:00",
    distance: "0.8 km away"
  },
  {
    id: 'xjtlu',
    name: "Xi'an Jiaotong Liverpool University Sports Centre",
    address: "111 XJTLU South Campus, Taicang",
    hours: "06:00 - 22:00",
    distance: "1.2 km away"
  }
];

const EQUIPMENT_DATA = {
  badminton: [
    {
      id: 'bd1',
      name: 'Yonex Astrox 88D Pro',
      price: 25,
      deposit: 200,
      rating: 4.8,
      reviews: 124,
      image: require('../assets/equipment/badminton-racket-pro.jpg'),
      details: 'Professional grade badminton racket, perfect for offensive players',
      available: 3
    },
    {
      id: 'bd2',
      name: 'Lining N7II',
      price: 20,
      deposit: 150,
      rating: 4.6,
      reviews: 89,
      image: require('../assets/equipment/badminton-racket-mid.jpg'),
      details: 'Mid-range racket suitable for intermediate players',
      available: 5
    },
    {
      id: 'bd3',
      name: 'Starter Racket Set',
      price: 15,
      deposit: 100,
      rating: 4.5,
      reviews: 156,
      image: require('../assets/equipment/badminton-racket-basic.jpg'),
      details: 'Perfect for beginners, includes 3 shuttlecocks',
      available: 8
    }
  ],
  tennis: [
    {
      id: 'tn1',
      name: 'Wilson Pro Staff RF97',
      price: 30,
      deposit: 300,
      rating: 4.9,
      reviews: 92,
      image: require('../assets/equipment/tennis-racket-pro.jpg'),
      details: 'Professional tennis racket, endorsed by top players',
      available: 2
    }
  ],
  basketball: [
    {
      id: 'bb1',
      name: 'Spalding NBA Official',
      price: 15,
      deposit: 100,
      rating: 4.7,
      reviews: 178,
      image: require('../assets/equipment/basketball-pro.jpg'),
      details: 'Official size and weight basketball',
      available: 6
    }
  ]
};

export default function EquipmentRental() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('badminton');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(2);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const [locationSheetAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [paymentSheetAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  const paymentMethods = [
    { id: 'alipay', name: 'Alipay', icon: 'alipay', color: '#1677FF' },
    { id: 'wechat', name: 'WeChat Pay', icon: 'wechat', color: '#07C160' },
    { id: 'card', name: 'Credit Card', icon: 'credit-card', color: '#666' },
    { id: 'apple', name: 'Apple Pay', icon: 'apple', color: '#000' }
  ];

  const categories = useMemo(() => [
    { id: 'badminton', name: 'Badminton', icon: 'badminton' },
    { id: 'tennis', name: 'Tennis', icon: 'tennis' },
    { id: 'basketball', name: 'Basketball', icon: 'basketball' }
  ], []);

  const calculateServiceFee = useCallback((price) => {
    return Math.max(2, Math.round(price * 0.05));
  }, []);

  const calculateTotal = (item) => {
    const rentalFee = item.price * selectedDuration;
    const serviceFee = calculateServiceFee(rentalFee);
    return rentalFee + serviceFee;
  };

  const showLocationSheet = (equipment) => {
    setSelectedEquipment(equipment);
    setShowLocationSelect(true);
    Animated.spring(locationSheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 65
    }).start();
  };

  const hideLocationSheet = () => {
    Animated.spring(locationSheetAnim, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
      friction: 8,
      tension: 65
    }).start(() => {
      setShowLocationSelect(false);
      setSelectedLocation(null);
    });
  };

  const showPaymentSheet = () => {
    setShowPaymentOptions(true);
    Animated.spring(paymentSheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 65
    }).start();
  };

  const hidePaymentSheet = () => {
    Animated.spring(paymentSheetAnim, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
      friction: 8,
      tension: 65
    }).start(() => setShowPaymentOptions(false));
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    hideLocationSheet();
    showPaymentSheet();
  };

  // Replace the handlePayment function in equipment.js with:

  const handlePayment = (method) => {
    // Add validation check
    if (!selectedEquipment || !selectedLocation) {
      Alert.alert('Error', 'Please select equipment and pickup location');
      return;
    }

    // Hide payment sheet
    setShowPaymentOptions(false);
      
    // Navigate with all required parameters
    router.push({
      pathname: '/rental-confirmation',
      params: {
        equipmentId: selectedEquipment.id,
        equipmentName: selectedEquipment.name,
        duration: selectedDuration,
        price: selectedEquipment.price,
        basePrice: selectedEquipment.price * selectedDuration,
        serviceFee: calculateServiceFee(selectedEquipment.price * selectedDuration),
        deposit: selectedEquipment.deposit,
        total: calculateTotal(selectedEquipment),
        paymentMethod: method.id,
        paymentMethodName: method.name,
        locationId: selectedLocation.id,
        locationName: selectedLocation.name,
        locationAddress: selectedLocation.address,
        pickupTime: new Date().toISOString() // Add default pickup time
      }
    });
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
        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.headerTitle}>Equipment Rental</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search equipment..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
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
                size={24}
                color={selectedCategory === category.id ? '#fff' : PRIMARY_GREEN}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Equipment List */}
      <ScrollView style={styles.equipmentList}>
        {EQUIPMENT_DATA[selectedCategory].map((item) => (
          <View key={item.id} style={styles.equipmentCard}>
            <Image source={item.image} style={styles.equipmentImage} />
            <View style={styles.equipmentInfo}>
              <Text style={styles.equipmentName}>{item.name}</Text>
              <Text style={styles.equipmentDetails}>{item.details}</Text>
              
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {item.rating} ({item.reviews} reviews)
                </Text>
                <View style={styles.availabilityTag}>
                  <Text style={styles.availabilityText}>
                    {item.available} available
                  </Text>
                </View>
              </View>

              <View style={styles.priceContainer}>
                <View>
                  <Text style={styles.priceLabel}>Rental Fee</Text>
                  <Text style={styles.priceValue}>¥{item.price}/hr</Text>
                </View>
                <View>
                  <Text style={styles.priceLabel}>Deposit</Text>
                  <Text style={styles.depositValue}>¥{item.deposit}</Text>
                </View>
              </View>

              <View style={styles.rentActions}>
                <View style={styles.durationControl}>
                  <TouchableOpacity 
                    onPress={() => selectedDuration > 1 && setSelectedDuration(prev => prev - 1)}
                    style={styles.durationButton}
                  >
                    <Text style={styles.durationButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.durationText}>{selectedDuration}h</Text>
                  <TouchableOpacity 
                    onPress={() => selectedDuration < 8 && setSelectedDuration(prev => prev + 1)}
                    style={styles.durationButton}
                  >
                    <Text style={styles.durationButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.rentButton}
                  onPress={() => showLocationSheet(item)}
                >
                  <LinearGradient
                    colors={[PRIMARY_GREEN, DARK_GREEN]}
                    style={styles.rentButtonGradient}
                  >
                    <Text style={styles.rentButtonText}>
                      Rent • ¥{calculateTotal(item)}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.serviceFeeNote}>
                <Ionicons name="information-circle-outline" size={14} color="#666" />
                <Text style={styles.serviceFeeText}>
                  Includes ¥{calculateServiceFee(item.price * selectedDuration)} service fee
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Location Selection Sheet */}
      {showLocationSelect && (
        <BlurView intensity={80} style={styles.overlay}>
          <Animated.View 
            style={[
              styles.locationSheet,
              {
                transform: [{ translateY: locationSheetAnim }]
              }
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Pickup Location</Text>
              <TouchableOpacity 
                onPress={hideLocationSheet}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.locationList}>
              {PICKUP_LOCATIONS.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={styles.locationCard}
                  onPress={() => handleLocationSelect(location)}
                >
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{location.name}</Text>
                    <Text style={styles.locationAddress}>{location.address}</Text>
                    <View style={styles.locationDetails}>
                      <View style={styles.locationDetail}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.locationDetailText}>{location.hours}</Text>
                      </View>
                      <View style={styles.locationDetail}>
                        <Ionicons name="location-outline" size={16} color="#666" />
                        <Text style={styles.locationDetailText}>{location.distance}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </BlurView>
      )}

      {/* Payment Sheet */}
      {showPaymentOptions && (
        <BlurView intensity={80} style={styles.overlay}>
          <Animated.View 
            style={[
              styles.paymentSheet,
              {
                transform: [{ translateY: paymentSheetAnim }]
              }
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Payment Method</Text>
              <TouchableOpacity 
                onPress={hidePaymentSheet}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentSummary}>
              <Text style={styles.summaryTitle}>Rental Summary</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Equipment</Text>
                <Text style={styles.summaryValue}>{selectedEquipment?.name}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{selectedDuration} hours</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Pickup Location</Text>
                <Text style={styles.summaryValue}>{selectedLocation?.name}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Rental Fee</Text>
                <Text style={styles.summaryValue}>¥{selectedEquipment?.price * selectedDuration}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Service Fee</Text>
                <Text style={styles.summaryValue}>¥{calculateServiceFee(selectedEquipment?.price * selectedDuration)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Deposit (Refundable)</Text>
                <Text style={styles.summaryValue}>¥{selectedEquipment?.deposit}</Text>
              </View>
              <View style={[styles.summaryItem, styles.totalItem]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ¥{selectedEquipment ? calculateTotal(selectedEquipment) : 0}
                </Text>
              </View>
            </View>

            <View style={styles.paymentMethods}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={styles.paymentMethod}
                  onPress={() => handlePayment(method)}
                  activeOpacity={0.7}
                >
                  <View 
                    style={[
                      styles.paymentIcon, 
                      { backgroundColor: `${method.color}20` } // Adding transparency
                    ]}
                  >
                    <FontAwesome5 name={method.icon} size={24} color={method.color} />
                  </View>
                  <Text style={styles.paymentMethodText}>{method.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.paymentNote}>
              <Ionicons name="information-circle-outline" size={14} color="#666" /> 
              Select a payment method to proceed to rental details
            </Text>
          </Animated.View>
        </BlurView>
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
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: 16,
    height: Platform.OS === 'android' ? 80 : 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    padding: 8,
  },
  cartButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  categoriesWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    width: 120,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    marginRight: 8,
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: PRIMARY_GREEN,
  },
  categoryText: {
    fontSize: 15,
    color: PRIMARY_GREEN,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  equipmentList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  equipmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
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
  equipmentImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  equipmentInfo: {
    padding: 16,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 4,
  },
  equipmentDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  availabilityTag: {
    marginLeft: 'auto',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 12,
    color: PRIMARY_GREEN,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY_GREEN,
  },
  depositValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  rentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    paddingHorizontal: 16,
    fontSize: 16,
  },
  rentButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  rentButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  serviceFeeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 4,
  },
  serviceFeeText: {
    fontSize: 12,
    color: '#666',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  locationSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  paymentSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  locationList: {
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
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
  paymentSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#666',
  },
  summaryValue: {
    fontWeight: '500',
  },
  totalItem: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY_GREEN,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
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
  paymentNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});
