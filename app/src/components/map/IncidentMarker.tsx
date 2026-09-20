import React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { Incident, IncidentType, confidenceLevel } from '@/types/domain';

const ICONS: Record<IncidentType, keyof typeof Ionicons.glyphMap> = {
  traffic_jam: 'car',
  heavy_traffic: 'car-sport',
  road_blocked: 'close-circle',
  accident: 'warning',
  police: 'shield',
  construction: 'construct',
  pothole: 'ellipse',
  bad_road: 'trail-sign',
  waterlogging: 'water',
  broken_signal: 'radio-button-off',
  toll: 'cash',
  hazard: 'alert',
  breakdown: 'build',
  other: 'information-circle',
};

function toneFor(type: IncidentType, colors: ReturnType<typeof useTheme>['colors']) {
  if (type === 'accident' || type === 'road_blocked') return colors.danger;
  if (type === 'waterlogging' || type === 'police' || type === 'hazard') return colors.caution;
  return colors.info;
}

interface Props {
  incident: Incident;
  onPress?: (incident: Incident) => void;
}

export function IncidentMarker({ incident, onPress }: Props) {
  const { colors } = useTheme();
  const tone = toneFor(incident.type, colors);
  const level = confidenceLevel(incident.confidence);
  const size = incident.severity >= 3 ? 40 : incident.severity === 2 ? 34 : 28;

  return (
    <Marker
      coordinate={incident.location}
      onPress={() => onPress?.(incident)}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tone,
          borderWidth: 2.5,
          borderColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: level === 'low' ? 0.7 : 1,
        }}
      >
        <Ionicons name={ICONS[incident.type]} size={size * 0.5} color={colors.onDanger} />
      </View>
    </Marker>
  );
}
