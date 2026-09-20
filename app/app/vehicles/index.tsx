import React, { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/StateViews';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { useVehicleStore } from '@/store/vehicleStore';

export default function VehicleList() {
  const { colors, spacing } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { vehicles, status, fetch, setDefault } = useVehicleStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title={t('vehicle.myVehicles')} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}>
        {status === 'loading' && vehicles.length === 0 && (
          <>
            <Skeleton height={72} radius={14} style={{ marginBottom: spacing.sm }} />
            <Skeleton height={72} radius={14} style={{ marginBottom: spacing.sm }} />
          </>
        )}

        {status === 'loaded' && vehicles.length === 0 && (
          <EmptyState
            icon="bicycle-outline"
            title={t('vehicle.addVehicle')}
            actionLabel={t('vehicle.addVehicle')}
            onAction={() => router.push('/vehicles/add')}
          />
        )}

        {vehicles.map((v) => (
          <VehicleCard key={v.id} vehicle={v} onPress={() => setDefault(v.id)} />
        ))}
      </ScrollView>

      {vehicles.length > 0 && (
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md }}>
          <Button label={t('vehicle.addVehicle')} onPress={() => router.push('/vehicles/add')} icon="add" size="lg" fullWidth />
        </View>
      )}
    </View>
  );
}
