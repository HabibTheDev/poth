import React, { useRef, useState } from 'react';
import { View, FlatList, Dimensions, ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { LogoLockup } from '@/components/brand/Logo';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = 'poth.onboarding-complete';

const ICONS: (keyof typeof Ionicons.glyphMap)[] = ['navigate-circle', 'people-circle', 'speedometer'];

export default function Onboarding() {
  const { colors, spacing } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const slides = [
    { title: t('onboarding.slide1Title'), body: t('onboarding.slide1Body') },
    { title: t('onboarding.slide2Title'), body: t('onboarding.slide2Body') },
    { title: t('onboarding.slide3Title'), body: t('onboarding.slide3Body') },
  ];

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(auth)/login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  const isLast = index === slides.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
        }}
      >
        <LogoLockup size={32} />
        <Button
          label={locale === 'en' ? 'বাংলা' : 'English'}
          onPress={() => setLocale(locale === 'en' ? 'bn' : 'en')}
          variant="ghost"
          size="sm"
          haptics={false}
        />
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item, index: i }) => (
          <View style={{ width, paddingHorizontal: spacing.xl, justifyContent: 'center', flex: 1 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 28,
                backgroundColor: colors.brandSubtle,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xl,
              }}
            >
              <Ionicons name={ICONS[i]} size={44} color={colors.brand} />
            </View>
            <Text variant="h1" weight="bold" style={{ marginBottom: spacing.sm }}>
              {item.title}
            </Text>
            <Text variant="body" color={colors.inkSubtle}>
              {item.body}
            </Text>
          </View>
        )}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.lg }}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === index ? 22 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === index ? colors.brand : colors.hairline,
              marginHorizontal: 3,
            }}
          />
        ))}
      </View>

      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.lg }}>
        <Button
          label={isLast ? t('onboarding.getStarted') : t('common.next')}
          onPress={() => {
            if (isLast) {
              finish();
            } else {
              listRef.current?.scrollToIndex({ index: index + 1 });
            }
          }}
          size="lg"
          fullWidth
        />
        {!isLast && (
          <Button label={t('onboarding.skip')} onPress={finish} variant="ghost" size="sm" style={{ marginTop: spacing.sm }} />
        )}
      </View>
    </View>
  );
}
