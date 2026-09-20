import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Divider } from '@/components/ui/Divider';
import { TripCostEstimate } from '@/types/domain';

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
      <Text variant={strong ? 'body' : 'bodySm'} weight={strong ? 'semibold' : 'regular'} color={strong ? colors.ink : colors.inkMuted}>
        {label}
      </Text>
      <Text variant={strong ? 'body' : 'bodySm'} weight={strong ? 'bold' : 'medium'}>
        {value}
      </Text>
    </View>
  );
}

export function TripCostCard({ estimate }: { estimate: TripCostEstimate }) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.sheet, padding: spacing.lg, borderWidth: 1, borderColor: colors.hairline }}>
      <Text variant="bodySm" weight="semibold" color={colors.inkMuted} style={{ marginBottom: spacing.xs }}>
        {t('trip.costTitle')}
      </Text>
      <Row label={t('trip.distance')} value={`${estimate.distanceKm} ${t('common.km')}`} />
      <Row label={t('trip.fuelCost')} value={`৳${estimate.fuelCostBdt}`} />
      {estimate.tollCostBdt > 0 && <Row label={t('trip.tollCost')} value={`৳${estimate.tollCostBdt}`} />}
      <Row label={t('trip.parkingCost')} value={`৳${estimate.parkingCostBdt}`} />
      <Divider />
      <View style={{ marginTop: spacing.xs }}>
        <Row label={t('trip.total')} value={`৳${estimate.totalBdt}`} strong />
      </View>
    </View>
  );
}
