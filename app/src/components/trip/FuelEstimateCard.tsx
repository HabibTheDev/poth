import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { FuelEstimate } from '@/types/domain';

export function FuelEstimateCard({ estimate }: { estimate: FuelEstimate }) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();

  const tone = estimate.canReach ? colors.brand : colors.danger;
  const toneSubtle = estimate.canReach ? colors.brandSubtle : colors.dangerSubtle;

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.sheet, padding: spacing.lg, borderWidth: 1, borderColor: colors.hairline }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: toneSubtle,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.xs,
          }}
        >
          <Ionicons name={estimate.canReach ? 'checkmark' : 'warning'} size={16} color={tone} />
        </View>
        <Text variant="body" weight="semibold" color={tone} style={{ flex: 1 }}>
          {estimate.canReach ? t('fuel.canReach') : t('fuel.cannotReach')}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={colors.inkMuted}>
            {t('fuel.estimatedRequired')}
          </Text>
          <Text variant="midStat" weight="bold">
            {estimate.fuelRequiredLiters} L
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={colors.inkMuted}>
            {estimate.canReach ? t('fuel.estimatedRemaining') : t('fuel.shortfall')}
          </Text>
          <Text variant="midStat" weight="bold" color={estimate.canReach ? colors.ink : colors.danger}>
            {estimate.canReach ? estimate.estimatedRemainingLiters : estimate.shortfallLiters} L
          </Text>
        </View>
      </View>

      {!estimate.canReach && estimate.recommendedStopAtKm !== undefined && (
        <View
          style={{
            backgroundColor: colors.cautionSubtle,
            borderRadius: radius.card,
            padding: spacing.sm,
            marginBottom: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="navigate" size={16} color={colors.caution} style={{ marginRight: 8 }} />
          <Text variant="bodySm" weight="medium" color={colors.onCaution}>
            {t('fuel.recommendedStop')}: {estimate.recommendedStopAtKm} {t('common.km')} {t('fuel.ahead')}
          </Text>
        </View>
      )}

      <Text variant="micro" color={colors.inkMuted}>
        {t('fuel.disclaimer')}
      </Text>
    </View>
  );
}
