import {DarkTheme, DefaultTheme, NavigationContainerRefWithCurrent, ThemeProvider} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {Stack, useNavigationContainerRef} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import {navigationRef} from "@/app/navigation/RootNavigation";
import {RootStackParamList} from "@/app/(tabs)/HomePage";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const ref = useNavigationContainerRef();

  // Save it globally
  useEffect(() => {
    navigationRef.current = ref as NavigationContainerRefWithCurrent<RootStackParamList>
  }, [ref]);

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
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
