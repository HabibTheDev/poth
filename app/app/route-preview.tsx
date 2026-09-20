import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { RouteOptionCard } from '@/components/route/RouteOptionCard';
import { FuelEstimateCard } from '@/components/trip/FuelEstimateCard';
import { TripCostCard } from '@/components/trip/TripCostCard';

import { useLocation } from '@/hooks/useLocation';
import { useVehicleStore } from '@/store/vehicleStore';
import { services } from '@/services';
import { FuelEstimate, RouteOption, RoutePreference, TripCostEstimate, LatLng } from '@/types/domain';

function pseudoGeocode(label: string, origin: LatLng): LatLng {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) % 100000;
  const latOffset = ((hash % 200) - 100) / 4000; // roughly +-0.025 deg
  const lngOffset = (((hash * 7) % 200) - 100) / 4000;
  return { latitude: origin.latitude + latOffset, longitude: origin.longitude + lngOffset };
}

export default function RoutePreview() {
  const { colors, spacing } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ destinationLabel: string }>();
  const { coords } = useLocation();
  const activeVehicle = useVehicleStore((s) => s.vehicles.find((v) => v.isDefault) ?? s.vehicles[0]);

  const destination = useMemo(() => pseudoGeocode(params.destinationLabel ?? 'Destination', coords), [params.destinationLabel]);

  const [options, setOptions] = useState<RouteOption[] | null>(null);
  const [selected, setSelected] = useState<RoutePreference>('fastest');
  const [fuelEstimate, setFuelEstimate] = useState<FuelEstimate | null>(null);
  const [costEstimate, setCostEstimate] = useState<TripCostEstimate | null>(null);

  useEffect(() => {
    services.navigation.getRouteOptions(coords, destination).then((opts) => {
      setOptions(opts);
      const fastest = opts.find((o) => o.preference === 'fastest');
      if (fastest) loadEstimates(fastest);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEstimates = async (opt: RouteOption) => {
    if (!activeVehicle) return;
    const [fuel, cost] = await Promise.all([
      services.fuel.estimate({
        distanceKm: opt.distanceKm,
        mileageKmPerLiter: activeVehicle.mileageKmPerLiter,
        fuelAvailableLiters: activeVehicle.currentFuelLiters,
        tankCapacityLiters: activeVehicle.tankCapacityLiters,
      }),
      services.trips.estimateCost({ distanceKm: opt.distanceKm, mileageKmPerLiter: activeVehicle.mileageKmPerLiter }),
    ]);
    setFuelEstimate(fuel);
    setCostEstimate(cost);
  };

  const handleSelect = (opt: RouteOption) => {
    setSelected(opt.preference);
    loadEstimates(opt);
  };

  const startNav = () => {
    router.replace({
      pathname: '/navigation/active',
      params: {
        destLat: String(destination.latitude),
        destLng: String(destination.longitude),
        destinationLabel: params.destinationLabel,
      },
    });
  };

  const selectedOption = options?.find((o) => o.preference === selected);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={colors.inkMuted}>
            {t('home.searchPlaceholder')}
          </Text>
          <Text variant="h3" weight="bold" numberOfLines={1}>
            {params.destinationLabel}
          </Text>
        </View>
        <IconButton icon="close" accessibilityLabel={t('common.cancel')} variant="flat" onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
        {options === null ? (
          <View>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={64} radius={14} style={{ marginBottom: spacing.sm }} />
            ))}
          </View>
        ) : (
          options.map((opt) => (
            <RouteOptionCard key={opt.id} option={opt} selected={opt.preference === selected} onPress={() => handleSelect(opt)} />
          ))
        )}

        {fuelEstimate && (
          <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
            <FuelEstimateCard estimate={fuelEstimate} />
          </View>
        )}
        {costEstimate && <TripCostCard estimate={costEstimate} />}
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md }}>
        <Button
          label={`${t('home.startNav')}${selectedOption ? ` · ${selectedOption.durationMin} ${t('common.min')}` : ''}`}
          onPress={startNav}
          size="lg"
          fullWidth
          disabled={!selectedOption}
        />
      </View>
    </View>
  );
}
