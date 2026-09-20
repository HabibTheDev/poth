import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/StateViews';
import { IncidentListCard } from '@/components/incident/IncidentListCard';
import { IncidentMarker } from '@/components/map/IncidentMarker';
import { PlaceMarker } from '@/components/map/PlaceMarker';
import { UserPuck } from '@/components/map/UserPuck';

import { useLocation } from '@/hooks/useLocation';
import { useVehicleStore } from '@/store/vehicleStore';
import { services } from '@/services';
import { Incident, Place } from '@/types/domain';
import { config } from '@/services/config';
import { formatDistance, haversineKm } from '@/utils/geo';

export default function HomeMap() {
  const { colors, spacing } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<BottomSheet>(null);

  const { coords, permission, requestPermission } = useLocation({ active: false });
  const { vehicles, fetch: fetchVehicles } = useVehicleStore();

  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadError, setLoadError] = useState(false);

  const loadNearby = useCallback(async () => {
    setLoadError(false);
    try {
      const [inc, pl] = await Promise.all([
        services.incidents.listNearby(coords, config.nearbyIncidentRadiusKm),
        services.places.listNearby(coords),
      ]);
      setIncidents(inc);
      setPlaces(pl);
    } catch {
      setLoadError(true);
    }
  }, [coords]);

  useEffect(() => {
    fetchVehicles();
    requestPermission();
  }, [fetchVehicles, requestPermission]);

  useEffect(() => {
    loadNearby();
  }, [loadNearby]);

  const snapPoints = useMemo(() => ['16%', '46%', '85%'], []);

  const recenter = () => {
    mapRef.current?.animateToRegion(
      { ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      400
    );
  };

  const activeVehicle = vehicles.find((v) => v.isDefault) ?? vehicles[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{ ...coords, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        <UserPuck coordinate={coords} />
        {incidents?.map((incident) => (
          <IncidentMarker key={incident.id} incident={incident} onPress={() => sheetRef.current?.snapToIndex(1)} />
        ))}
        {places.map((place) => (
          <PlaceMarker key={place.id} place={place} />
        ))}
      </MapView>

      {/* Top chrome: search + vehicle switcher */}
      <View style={{ position: 'absolute', top: insets.top + spacing.sm, left: spacing.md, right: spacing.md }}>
        <Pressable
          onPress={() => router.push('/search')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.mapChromeBg,
            borderRadius: 999,
            paddingHorizontal: spacing.md,
            height: 52,
            ...colors.shadow.floating,
          }}
        >
          <Ionicons name="search" size={19} color={colors.inkMuted} />
          <Text variant="body" color={colors.inkMuted} style={{ marginLeft: 10, flex: 1 }}>
            {t('home.searchPlaceholder')}
          </Text>
          {activeVehicle && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.brandSubtle,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Ionicons name="bicycle" size={13} color={colors.brandStrong} />
              <Text variant="micro" weight="semibold" color={colors.brandStrong} style={{ marginLeft: 4 }}>
                {activeVehicle.model}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Floating controls, anchored bottom-right for one-handed reach */}
      <View
        style={{
          position: 'absolute',
          right: spacing.md,
          bottom: 170,
          alignItems: 'flex-end',
        }}
      >
        <IconButton
          icon="locate"
          accessibilityLabel={t('home.recenter')}
          onPress={recenter}
          style={{ marginBottom: spacing.sm }}
        />
        <IconButton
          icon="add"
          accessibilityLabel={t('home.quickReport')}
          variant="brand"
          size={56}
          onPress={() => router.push('/report-incident')}
        />
      </View>

      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: colors.bgElevated }}
        handleIndicatorStyle={{ backgroundColor: colors.hairline, width: 40 }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}>
          <Text variant="h3" weight="semibold" style={{ marginBottom: spacing.sm }}>
            {t('home.nearbyTitle')}
          </Text>

          {loadError && (
            <EmptyState icon="cloud-offline-outline" title={t('errors.genericTitle')} body={t('errors.genericBody')} actionLabel={t('common.retry')} onAction={loadNearby} />
          )}

          {!loadError && incidents === null && (
            <View>
              {[1, 2, 3].map((i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm }}>
                  <Skeleton width={40} height={40} radius={14} style={{ marginRight: spacing.sm }} />
                  <View style={{ flex: 1 }}>
                    <Skeleton width="70%" height={14} style={{ marginBottom: 6 }} />
                    <Skeleton width="40%" height={10} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {!loadError && incidents !== null && incidents.length === 0 && (
            <EmptyState icon="checkmark-done-circle-outline" title={t('home.nearbyEmpty')} />
          )}

          {!loadError &&
            incidents?.map((incident) => (
              <IncidentListCard
                key={incident.id}
                incident={incident}
                distanceLabel={formatDistance(haversineKm(coords, incident.location))}
                onPress={() => {}}
              />
            ))}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
