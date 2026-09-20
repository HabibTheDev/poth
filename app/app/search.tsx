import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { IconButton } from '@/components/ui/IconButton';
import { mockPlaces } from '@/mocks/dhaka';

const SAVED = [
  { icon: 'home' as const, labelKey: 'home.home', address: 'Dhanmondi 27, Dhaka' },
  { icon: 'briefcase' as const, labelKey: 'home.work', address: 'Karwan Bazar, Dhaka' },
];

export default function Search() {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const results = query.length > 0
    ? mockPlaces.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const goToRoutePreview = (label: string) => {
    router.replace({ pathname: '/route-preview', params: { destinationLabel: label } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Input
            placeholder={t('home.searchPlaceholder')}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => query && goToRoutePreview(query)}
          />
        </View>
        <IconButton icon="close" accessibilityLabel={t('common.cancel')} variant="flat" onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
        {query.length === 0 && (
          <>
            <Text variant="bodySm" weight="semibold" color={colors.inkMuted} style={{ marginBottom: spacing.sm }}>
              {t('home.savedPlaces')}
            </Text>
            {SAVED.map((s) => (
              <Pressable
                key={s.labelKey}
                onPress={() => goToRoutePreview(t(s.labelKey))}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: radius.card,
                    backgroundColor: colors.surfaceAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.sm,
                  }}
                >
                  <Ionicons name={s.icon} size={18} color={colors.inkSubtle} />
                </View>
                <View>
                  <Text variant="bodySm" weight="semibold">
                    {t(s.labelKey)}
                  </Text>
                  <Text variant="caption" color={colors.inkMuted}>
                    {s.address}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {query.length > 0 &&
          results.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => goToRoutePreview(r.name)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.card,
                  backgroundColor: colors.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.sm,
                }}
              >
                <Ionicons name="location" size={18} color={colors.inkSubtle} />
              </View>
              <View>
                <Text variant="bodySm" weight="semibold">
                  {r.name}
                </Text>
                {r.address && (
                  <Text variant="caption" color={colors.inkMuted}>
                    {r.address}
                  </Text>
                )}
              </View>
            </Pressable>
          ))}

        {query.length > 0 && results.length === 0 && (
          <Pressable
            onPress={() => goToRoutePreview(query)}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.card,
                backgroundColor: colors.surfaceAlt,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.sm,
              }}
            >
              <Ionicons name="search" size={18} color={colors.inkSubtle} />
            </View>
            <Text variant="bodySm" weight="semibold">
              {query}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
