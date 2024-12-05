// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

const PRIMARY_GREEN = '#2e7d32';
const DARK_GREEN = '#1a472a';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: DARK_GREEN,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#fff',
          },
        }}
      >
        {/* Tabs Navigation */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Original Routes */}
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
        
        {/* Main App Routes */}
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="venue-booking"
          options={{
            title: 'Book a Venue',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="booking-confirmation"
          options={{
            title: 'Confirm Booking',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="equipment"
          options={{
            title: 'Equipment Rental',
            headerStyle: {
              backgroundColor: DARK_GREEN,
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="community"
          options={{
            title: 'Community',
            headerStyle: {
              backgroundColor: DARK_GREEN,
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="sparring"
          options={{
            title: 'Find Sparring Partner',
            headerStyle: {
              backgroundColor: DARK_GREEN,
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="leaderboard"
          options={{
            title: 'Leaderboard',
            headerStyle: {
              backgroundColor: DARK_GREEN,
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="competitions"
          options={{
            title: 'Competitions',
            headerStyle: {
              backgroundColor: DARK_GREEN,
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="buddies"
          options={{
            title: 'Find Buddies',
            headerStyle: {
              backgroundColor: DARK_GREEN,
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}