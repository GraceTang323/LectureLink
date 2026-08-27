import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Stack, useSegments, useRouter } from "expo-router";
import { AuthProvider } from '@/src/context/AuthContext';
import { useAuth } from "@/src/hooks/useAuth";
import { useEffect } from "react";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  )
}

// Handles expo router redirect upon launch
function AppNavigator() {
  const { authState } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (authState.loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments.includes("onboarding");

    if (!authState.authenticated && !inAuthGroup) {
      router.replace("/(auth)/login");          // not logged in

    } else if (authState.authenticated && 
      !authState.profileComplete && !inOnboarding) {
      router.replace("/onboarding/create");     // profile incomplete and NOT currently in onboarding

    } else if (authState.authenticated && authState.profileComplete && (inAuthGroup || inOnboarding)) {
      router.replace("/(tabs)");                // home screen

    }

  }, [authState.loading, authState.authenticated, authState.profileComplete, segments]);

  if (authState.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  // Both (auth) and (tabs) groups are part of the route tree
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(auth)" options={{ presentation: 'modal'}}/>
  </Stack>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
});