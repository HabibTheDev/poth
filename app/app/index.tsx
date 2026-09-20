import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/store/authStore';

const ONBOARDING_KEY = 'poth.onboarding-complete';

export default function Index() {
  const { colors } = useTheme();
  const { status, hydrate } = useAuthStore();
  const [seenOnboarding, setSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    hydrate();
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => setSeenOnboarding(v === 'true'));
  }, [hydrate]);

  if (status === 'idle' || status === 'loading' || seenOnboarding === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!seenOnboarding) return <Redirect href="/onboarding" />;
  if (status === 'unauthenticated') return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}
