import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { IconButton } from '@/components/ui/IconButton';
import { NavAlertBanner } from '@/components/incident/NavAlertBanner';
import { StillThereCard } from '@/components/incident/StillThereCard';
import { UserPuck } from '@/components/map/UserPuck';
import { IncidentMarker } from '@/components/map/IncidentMarker';

import { useLocation } from '@/hooks/useLocation';
import { services } from '@/services';
import { Incident, LatLng } from '@/types/domain';
import { config } from '@/services/config';
import { haversineMeters } from '@/utils/geo';

export default function ActiveNavigation() {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ destLat: string; destLng: string; destinationLabel: string }>();
  const mapRef = useRef<MapView>(null);

  const destination: LatLng = { latitude: Number(params.destLat), longitude: Number(params.destLng) };
  const { coords } = useLocation({ active: true });

  const [route, setRoute] = useState<LatLng[]>([]);
  const [remainingKm, setRemainingKm] = useState(0);
  const [etaMin, setEtaMin] = useState(0);
  const [currentRoad, setCurrentRoad] = useState('');
  const [voiceOn, setVoiceOn] = useState(true);
  const [nearbyIncidents, setNearbyIncidents] = useState<Incident[]>([]);
  const [activeAlert, setActiveAlert] = useState<Incident | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Incident | null>(null);
  const dismissedAlerts = useRef<Set<string>>(new Set());
  const progressRef = useRef(0); // 0..1 along the route, simulated

  useEffect(() => {
    services.navigation.getRoutePolyline(coords, destination, 'fastest').then(setRoute);
    services.incidents.listNearby(coords, config.nearbyIncidentRadiusKm).then(setNearbyIncidents);
    services.navigation
      .getRouteOptions(coords, destination)
      .then((opts) => {
        const fastest = opts.find((o) => o.preference === 'fastest') ?? opts[0];
        if (fastest) {
          setRemainingKm(fastest.distanceKm);
          setEtaMin(fastest.durationMin);
        }
      });
    setCurrentRoad('Mirpur Road');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulated progress along the route — demonstrates the live nav UI without a
  // real turn-by-turn engine wired up yet. Swap for real GPS-matched progress
  // once NavigationService.getRoutePolyline is backed by a real routing provider.
  useEffect(() => {
    if (route.length === 0) return;
    const interval = setInterval(() => {
      progressRef.current = Math.min(1, progressRef.current + 0.01);
      const idx = Math.floor(progressRef.current * (route.length - 1));
      const point = route[idx];

      setRemainingKm((prev) => Math.max(0, Number((prev - 0.05).toFixed(2))));
      setEtaMin((prev) => Math.max(0, prev - (progressRef.current > 0.99 ? 1 : 0.15)));

      mapRef.current?.animateCamera({ center: point, heading: idx * 4, pitch: 45, zoom: 17 }, { duration: 900 });

      // Check proximity to nearby incidents for alert banner + still-there prompt
      for (const incident of nearbyIncidents) {
        const distance = haversineMeters(point, incident.location);
        const alertDistance = config.incidentAlertDistanceMeters[incident.type] ?? config.incidentAlertDistanceMeters.default;

        if (distance <= alertDistance && !dismissedAlerts.current.has(incident.id)) {
          setActiveAlert(incident);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          dismissedAlerts.current.add(incident.id);
          setTimeout(() => setActiveAlert((cur) => (cur?.id === incident.id ? null : cur)), 4500);
        }

        if (distance <= 60 && !confirmTarget) {
          setConfirmTarget(incident);
        }
      }

      if (progressRef.current >= 1) clearInterval(interval);
    }, 1200);

    return () => clearInterval(interval);
  }, [route, nearbyIncidents, confirmTarget]);

  const handleConfirm = async (stillActive: boolean) => {
    if (!confirmTarget) return;
    await services.incidents.confirm(confirmTarget.id, stillActive);
    setConfirmTarget(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{ ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        showsUserLocation={false}
        showsCompass={false}
        pitchEnabled
      >
        {route.length > 1 && <Polyline coordinates={route} strokeColor={colors.brand} strokeWidth={6} />}
        <UserPuck coordinate={coords} />
        {nearbyIncidents.map((incident) => (
          <IncidentMarker key={incident.id} incident={incident} />
        ))}
      </MapView>

      {/* Top: end + voice controls, alert banner */}
      <View style={{ position: 'absolute', top: insets.top + spacing.sm, left: spacing.md, right: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
          <IconButton icon="close" accessibilityLabel={t('navigation.end')} onPress={() => router.replace('/(tabs)')} />
          <IconButton
            icon={voiceOn ? 'volume-high' : 'volume-mute'}
            accessibilityLabel={voiceOn ? t('navigation.voiceOn') : t('navigation.voiceOff')}
            onPress={() => setVoiceOn((v) => !v)}
          />
        </View>
        {activeAlert && <NavAlertBanner incident={activeAlert} distanceMeters={haversineMeters(coords, activeAlert.location)} />}
      </View>

      {/* Still-there confirmation, floats above the bottom info card */}
      {confirmTarget && (
        <View style={{ position: 'absolute', left: spacing.md, right: spacing.md, bottom: 190 }}>
          <StillThereCard incident={confirmTarget} onConfirm={handleConfirm} />
        </View>
      )}

      {/* Bottom: glanceable ETA / distance / current road */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.bgElevated,
          borderTopLeftRadius: radius.sheet,
          borderTopRightRadius: radius.sheet,
          paddingTop: spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.md,
          ...colors.shadow.sheet,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.xs }}>
          <Text variant="bigStat" weight="bold" color={colors.brand}>
            {Math.max(1, Math.round(etaMin))}
          </Text>
          <Text variant="body" weight="semibold" color={colors.inkMuted} style={{ marginLeft: 4, marginBottom: 8 }}>
            {t('common.min')}
          </Text>
          <View style={{ flex: 1 }} />
          <Text variant="h2" weight="bold">
            {remainingKm.toFixed(1)} {t('common.km')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="navigate" size={14} color={colors.inkMuted} />
          <Text variant="bodySm" color={colors.inkMuted} style={{ marginLeft: 6 }} numberOfLines={1}>
            {currentRoad}
          </Text>
        </View>
      </View>
    </View>
  );
}
