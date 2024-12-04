import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  StatusBar,
  Keyboard,
  FlatList,
  PanResponder,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';
const LIGHT_GREEN = '#4caf50';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 120 : 80 + STATUSBAR_HEIGHT;

// Memoized venue image component for better performance
const VenueImage = React.memo(({ source }) => (
  <View style={styles.imageContainer}>
    <Image
      source={source}
      style={styles.venueImage}
      resizeMode="cover"
    />
  </View>
));

// Memoized filter chip component
const FilterChip = React.memo(({ label, icon, isActive, onPress }) => (
  <TouchableOpacity 
    style={[styles.filterChip, isActive && styles.filterChipActive]}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
      {label}
    </Text>
    <View style={styles.filterChipIcon}>
      <MaterialCommunityIcons 
        name={icon} 
        size={16} 
        color={isActive ? PRIMARY_GREEN : '#666'} 
      />
    </View>
  </TouchableOpacity>
));

export default function VenueBooking() {
  const { sport } = useLocalSearchParams();
  const router = useRouter();
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState(['price']); // Track active filters
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const filterAnim = useRef(new Animated.Value(-200)).current;
  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Memoize venues data
  const venues = useMemo(() => [
    {
      id: 1,
      name: "Xi'an Jiaotong Liverpool University Sports Centre",
      location: "Taicang",
      rating: 4.8,
      reviews: 69,
      distance: "1.2 kilometres",
      price: "¥25",
      priceNum: 25,
      coordinates: {
        latitude: 31.4504,
        longitude: 121.1374
      },
      facilities: ["Free Parking", "Showers", "Lockers", "Equipment Rental", "Cafe", "WiFi"],
      openHours: "06:00 - 22:00",
      images: [
        require('../assets/venues/venue1-1.jpg'),
        require('../assets/venues/venue1-2.jpg'),
      ],
      availableSlots: Array.from({ length: 12 }, (_, i) => ({
        time: `${(8 + i).toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3
      }))
    },
    {
      id: 2,
      name: "Taicang Sports Complex",
      location: "Downtown Taicang",
      rating: 4.6,
      reviews: 42,
      distance: "0.8 kilometres",
      price: "¥35",
      priceNum: 35,
      coordinates: {
        latitude: 31.4580,
        longitude: 121.1290
      },
      facilities: ["Indoor Courts", "Cafe", "Pro Shop", "Parking", "Lockers"],
      openHours: "07:00 - 23:00",
      images: [
        require('../assets/venues/venue2-1.jpg'),
        require('../assets/venues/venue2-2.jpg'),
      ],
      availableSlots: Array.from({ length: 12 }, (_, i) => ({
        time: `${(8 + i).toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3
      }))
    }
  ], []);


  // Memoize filter options
  const filterOptions = useMemo(() => [
    { id: 'price', label: 'Price: Low to High', icon: 'chevron-down' },
    { id: 'rating', label: 'Rating: 4.5+', icon: 'star' },
    { id: 'distance', label: 'Distance: Nearest', icon: 'map-marker' }
  ], []);

  // Pan responder for venue details slide
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      const { dy, dx } = gestureState;
      return Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10;
    },
    onPanResponderGrant: () => {
      slideAnim.stopAnimation();
      slideAnim.extractOffset();
    },
    onPanResponderMove: Animated.event(
      [null, { dy: slideAnim }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, { dy, vy }) => {
      slideAnim.flattenOffset();
      if (dy > SCREEN_HEIGHT * 0.2 || vy > 0.5) {
        hideVenueDetails();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 65
        }).start();
      }
    }
  }), []);

  const hideVenueDetails = useCallback(() => {
    Keyboard.dismiss();
    Animated.spring(slideAnim, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
      friction: 8,
      tension: 65
    }).start(() => {
      setSelectedVenue(null);
      setCurrentImageIndex(0);
    });
  }, [slideAnim]);

  const showVenueDetails = useCallback((venue) => {
    setSelectedVenue(venue);
    setCurrentImageIndex(0);
    slideAnim.setValue(SCREEN_HEIGHT);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 65
    }).start();

    mapRef.current?.animateToRegion({
      latitude: venue.coordinates.latitude,
      longitude: venue.coordinates.longitude,
      latitudeDelta: 0.0122,
      longitudeDelta: 0.0121,
    }, 500);
  }, [slideAnim]);

  const toggleFilter = useCallback(() => {
    setIsFilterVisible(!isFilterVisible);
    Animated.spring(filterAnim, {
      toValue: isFilterVisible ? -200 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 65
    }).start();
  }, [isFilterVisible, filterAnim]);

  const handleFilterPress = useCallback((filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  }, []);

  const handleOverlayPress = useCallback((event) => {
    if (event.target === event.currentTarget) {
      hideVenueDetails();
    }
  }, [hideVenueDetails]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index);
    }
  }).current;

  // Memoize FlatList configurations
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }), []);

  const renderImageItem = useCallback(({ item }) => (
    <VenueImage source={item} />
  ), []);

  const keyExtractor = useCallback((_, index) => index.toString(), []);

  // Memoized venue details component
  const VenueDetails = useCallback(() => (
    <ScrollView
      ref={scrollViewRef}
      style={styles.venueInfo}
      showsVerticalScrollIndicator={true}
      bounces={true}
      scrollEventThrottle={16}
      overScrollMode="always"
      scrollEnabled={true}
      nestedScrollEnabled={true}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.venueName}>{selectedVenue?.name}</Text>
      
      <View style={styles.venueStats}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.statText}>
            {selectedVenue?.rating} ({selectedVenue?.reviews})
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="location" size={16} color={PRIMARY_GREEN} />
          <Text style={styles.statText}>{selectedVenue?.distance}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="time" size={16} color={PRIMARY_GREEN} />
          <Text style={styles.statText}>{selectedVenue?.openHours}</Text>
        </View>
      </View>

      {/* Available Times Section */}
      <Text style={styles.sectionTitle}>Available Times</Text>
      <View style={styles.timeGrid}>
        {selectedVenue?.availableSlots.map((slot, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.timeSlot,
              !slot.available && styles.timeSlotUnavailable
            ]}
            disabled={!slot.available}
          >
            <Text style={[
              styles.timeSlotText,
              !slot.available && styles.timeSlotTextUnavailable
            ]}>
              {slot.time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Facilities Section */}
      <Text style={styles.sectionTitle}>Facilities</Text>
      <View style={styles.facilitiesContainer}>
        {selectedVenue?.facilities.map((facility, index) => (
          <View key={index} style={styles.facilityTag}>
            <Text style={styles.facilityText}>{facility}</Text>
          </View>
        ))}
      </View>

      {/* Book Button */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => router.push({
          pathname: '/booking-confirmation',
          params: { 
            venueId: selectedVenue?.id,
            sport,
            venueName: selectedVenue?.name,
            price: selectedVenue?.price
          }
        })}
      >
        <LinearGradient
          colors={[PRIMARY_GREEN, DARK_GREEN]}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>
            Book Now • {selectedVenue?.price}/hr
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  ), [selectedVenue, sport, router]);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={DARK_GREEN} />
        
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <LinearGradient
            colors={[DARK_GREEN, PRIMARY_GREEN]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.headerGradient}
          >
            <View style={styles.headerRow}>
              <Link href="/" asChild>
                <TouchableOpacity style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
              </Link>
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" />
                  <TextInput 
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={`Search ${sport} venues`}
                    placeholderTextColor="rgba(255,255,255,0.6)"
                  />
                </View>
                <TouchableOpacity 
                  onPress={toggleFilter} 
                  style={[
                    styles.filterButton,
                    isFilterVisible && styles.filterButtonActive
                  ]}
                >
                  <MaterialCommunityIcons 
                    name="filter-variant" 
                    size={24} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </SafeAreaView>

        {/* Filter Panel */}
        <Animated.View 
          style={[styles.filterPanel, { transform: [{ translateY: filterAnim }] }]}
        >
          <View style={styles.filterContent}>
            <Text style={styles.filterTitle}>Filters</Text>
            <View style={styles.filterOptions}>
              {filterOptions.map((filter) => (
                <FilterChip
                  key={filter.id}
                  label={filter.label}
                  icon={filter.icon}
                  isActive={activeFilters.includes(filter.id)}
                  onPress={() => handleFilterPress(filter.id)}
                />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: 31.4504,
              longitude: 121.1374,
              latitudeDelta: 0.0122,
              longitudeDelta: 0.0121,
            }}
            onPress={handleOverlayPress}
          >
            {venues.map((venue) => (
              <Marker
                key={venue.id}
                coordinate={venue.coordinates}
                onPress={() => showVenueDetails(venue)}
                tracksViewChanges={false}
              >
                <Animated.View style={[
                  styles.markerContainer,
                  selectedVenue?.id === venue.id && styles.selectedMarker
                ]}>
                  <LinearGradient
                    colors={selectedVenue?.id === venue.id ? 
                      [LIGHT_GREEN, PRIMARY_GREEN] : 
                      [PRIMARY_GREEN, DARK_GREEN]
                    }
                    style={styles.markerGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                  >
                    <Text style={styles.markerPrice}>¥{venue.priceNum}</Text>
                  </LinearGradient>
                </Animated.View>
              </Marker>
            ))}
          </MapView>
        </View>

        {/* Venue Details Modal */}
        {selectedVenue && (
          <TouchableWithoutFeedback onPress={handleOverlayPress}>
            <View style={styles.overlay}>
              <Animated.View 
                style={[
                  styles.venueDetailsContainer,
                  { 
                    transform: [{ translateY: slideAnim }],
                    maxHeight: '85%'
                  }
                ]}
              >
                <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
                  <View style={styles.dragHandle} />
                </View>
                
                <View style={styles.venueContent}>
                  <FlatList
                    ref={flatListRef}
                    data={selectedVenue.images}
                    renderItem={renderImageItem}
                    keyExtractor={keyExtractor}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    style={styles.imageScroller}
                    snapToInterval={SCREEN_WIDTH}
                    decelerationRate="fast"
                    snapToAlignment="center"
                    scrollEventThrottle={16}
                    initialNumToRender={1}
                    maxToRenderPerBatch={2}
                    windowSize={2}
                    removeClippedSubviews={true}
                  />
                  
                  <View style={styles.dotIndicators}>
                    {selectedVenue.images.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          index === currentImageIndex && styles.activeDot
                        ]}
                      />
                    ))}
                  </View>

                  <VenueDetails />
                </View>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: HEADER_HEIGHT,
    backgroundColor: DARK_GREEN,
  },
  headerGradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: 'flex-end',
  },
  headerRow: {
    flexDirection: 'column',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
    height: 40,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: LIGHT_GREEN,
  },
  filterPanel: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  filterContent: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#e8f5e9',
    borderColor: PRIMARY_GREEN,
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  filterChipTextActive: {
    color: PRIMARY_GREEN,
    fontWeight: '500',
  },
  filterChipIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  selectedMarker: {
    transform: [{ scale: 1.1 }],
    ...Platform.select({
      ios: {
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  markerGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  mapContainer: {
    flex: 1,
    marginTop: HEADER_HEIGHT,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  venueDetailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dragHandleContainer: {
    width: '100%',
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
  },
  venueContent: {
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 180,
  },
  imageScroller: {
    height: 180,
  },
  venueImage: {
    width: SCREEN_WIDTH,
    height: 180,
  },
  dotIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    backgroundColor: '#fff',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
  },
  activeDot: {
    backgroundColor: PRIMARY_GREEN,
    transform: [{ scale: 1.2 }],
  },
  venueInfo: {
    maxHeight: SCREEN_HEIGHT * 0.5,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  venueName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_GREEN,
    marginVertical: 12,
  },
  venueStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statText: {
    color: '#666',
    fontSize: 13,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GREEN,
    marginBottom: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeSlot: {
    width: '23%',
    paddingVertical: 8,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PRIMARY_GREEN,
    alignItems: 'center',
  },
  timeSlotUnavailable: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  timeSlotText: {
    color: PRIMARY_GREEN,
    fontSize: 13,
    fontWeight: '500',
  },
  timeSlotTextUnavailable: {
    color: '#999',
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  facilityTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRIMARY_GREEN,
  },
  facilityText: {
    color: PRIMARY_GREEN,
    fontSize: 13,
  },
  bookButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonGradient: {
    paddingVertical: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});