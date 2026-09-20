import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/StateViews';
import { services } from '@/services';
import { Trip } from '@/types/domain';
import { formatRelativeTime } from '@/utils/geo';

export default function TripHistory() {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [trips, setTrips] = useState<Trip[] | null>(null);

  useEffect(() => {
    services.trips.listHistory().then(setTrips);
  }, []);

  const totalDistance = trips?.reduce((sum, t) => sum + t.distanceKm, 0) ?? 0;
  const avgMileage = trips && trips.length > 0
    ? (trips.reduce((sum, t) => sum + t.distanceKm, 0) / trips.reduce((sum, t) => sum + t.estimatedFuelLiters, 0)).toFixed(1)
    : '—';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
        <Text variant="h1" weight="bold">
          {t('trip.history')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}>
        <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
          <Card style={{ flex: 1, marginRight: spacing.sm }}>
            <Text variant="caption" color={colors.inkMuted}>
              {t('trip.monthlyDistance')}
            </Text>
            <Text variant="h2" weight="bold">
              {totalDistance.toFixed(0)} <Text variant="body" color={colors.inkMuted}>{t('common.km')}</Text>
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text variant="caption" color={colors.inkMuted}>
              {t('trip.avgMileage')}
            </Text>
            <Text variant="h2" weight="bold">
              {avgMileage} <Text variant="body" color={colors.inkMuted}>km/L</Text>
            </Text>
          </Card>
        </View>

        {trips === null && (
          <>
            <Skeleton height={64} radius={14} style={{ marginBottom: spacing.sm }} />
            <Skeleton height={64} radius={14} style={{ marginBottom: spacing.sm }} />
          </>
        )}

        {trips !== null && trips.length === 0 && <EmptyState icon="receipt-outline" title={t('trip.noTrips')} />}

        {trips?.map((trip) => (
          <View
            key={trip.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: colors.hairline,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="bodySm" weight="semibold" numberOfLines={1}>
                {trip.startLabel} → {trip.destinationLabel}
              </Text>
              <Text variant="caption" color={colors.inkMuted}>
                {trip.distanceKm} {t('common.km')} · {trip.durationMin} {t('common.min')} · {formatRelativeTime(trip.completedAt, t)}
              </Text>
            </View>
            <Text variant="bodySm" weight="bold">
              ৳{trip.estimatedCostBdt}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
