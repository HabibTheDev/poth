import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { RouteOption } from '@/types/domain';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  fastest: 'flash',
  cheapest: 'wallet',
  safest: 'shield-checkmark',
  best_road: 'trail-sign',
};

const LABEL_KEYS: Record<string, string> = {
  fastest: 'navigation.routeFastest',
  cheapest: 'navigation.routeCheapest',
  safest: 'navigation.routeSafest',
  best_road: 'navigation.routeBestRoad',
};

interface Props {
  option: RouteOption;
  selected: boolean;
  onPress: () => void;
}

export function RouteOptionCard({ option, selected, onPress }: Props) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing.md,
          borderRadius: radius.card,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? colors.brand : colors.hairline,
          backgroundColor: selected ? colors.brandSubtle : colors.surface,
          marginBottom: spacing.sm,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: selected ? colors.brand : colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.sm,
          }}
        >
          <Ionicons name={ICONS[option.preference]} size={19} color={selected ? colors.onBrand : colors.inkSubtle} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="body" weight="semibold">
            {t(LABEL_KEYS[option.preference])}
          </Text>
          <Text variant="caption" color={colors.inkMuted}>
            {option.distanceKm} {t('common.km')} · {option.durationMin} {t('common.min')} · ৳{option.fuelCostBdt}
          </Text>
        </View>
        {selected && <Ionicons name="checkmark-circle" size={22} color={colors.brand} />}
      </View>
    </Pressable>
  );
}
