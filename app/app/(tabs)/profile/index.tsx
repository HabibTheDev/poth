import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { useAuthStore } from '@/store/authStore';

function Row({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  const { colors, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md }}
    >
      <Ionicons name={icon} size={19} color={colors.inkSubtle} style={{ width: 28 }} />
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      {value && (
        <Text variant="bodySm" color={colors.inkMuted} style={{ marginRight: 6 }}>
          {value}
        </Text>
      )}
      {onPress && <Ionicons name="chevron-forward" size={16} color={colors.inkMuted} />}
    </Pressable>
  );
}

export default function Profile() {
  const { colors, spacing, preference, setPreference } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuthStore();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}>
        <View style={{ paddingTop: insets.top + spacing.lg, alignItems: 'center', marginBottom: spacing.lg }}>
          <Avatar name={user?.name ?? 'You'} size={72} />
          <Text variant="h2" weight="bold" style={{ marginTop: spacing.sm }}>
            {user?.name}
          </Text>
          <Text variant="bodySm" color={colors.inkMuted}>
            {user?.phone}
          </Text>
        </View>

        <Row icon="bicycle-outline" label={t('profile.vehicles')} onPress={() => router.push('/vehicles')} />
        <Divider />
        <Row icon="receipt-outline" label={t('profile.tripHistory')} onPress={() => router.push('/(tabs)/trips')} />
        <Divider />
        <Row icon="bookmark-outline" label={t('profile.savedPlaces')} onPress={() => {}} />
        <Divider />
        <Row icon="notifications-outline" label={t('profile.notifications')} onPress={() => {}} />
        <Divider />
        <Row icon="shield-checkmark-outline" label={t('profile.privacy')} onPress={() => {}} />

        <Text variant="bodySm" weight="semibold" color={colors.inkMuted} style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
          {t('profile.language')}
        </Text>
        <SegmentedTabs
          options={[
            { key: 'en', label: 'English' },
            { key: 'bn', label: 'বাংলা' },
          ]}
          value={locale}
          onChange={(v) => setLocale(v as 'en' | 'bn')}
        />

        <Text variant="bodySm" weight="semibold" color={colors.inkMuted} style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>
          {t('profile.theme')}
        </Text>
        <SegmentedTabs
          options={[
            { key: 'system', label: t('profile.themeSystem') },
            { key: 'light', label: t('profile.themeLight') },
            { key: 'dark', label: t('profile.themeDark') },
          ]}
          value={preference}
          onChange={(v) => setPreference(v as 'system' | 'light' | 'dark')}
        />

        <Pressable
          onPress={async () => {
            await signOut();
            router.replace('/(auth)/login');
          }}
          style={{ marginTop: spacing.xxl, alignItems: 'center' }}
        >
          <Text variant="body" weight="semibold" color={colors.danger}>
            {t('profile.signOut')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
