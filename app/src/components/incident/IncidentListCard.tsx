import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { Incident, confidenceLevel } from '@/types/domain';
import { formatRelativeTime } from '@/utils/geo';
import { INCIDENT_ICONS } from './incidentMeta';

interface Props {
  incident: Incident;
  distanceLabel?: string;
  onPress?: () => void;
}

export function IncidentListCard({ incident, distanceLabel, onPress }: Props) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();
  const level = confidenceLevel(incident.confidence);

  const tone =
    incident.type === 'accident' || incident.type === 'road_blocked'
      ? colors.danger
      : incident.type === 'waterlogging' || incident.type === 'police' || incident.type === 'hazard'
      ? colors.caution
      : colors.info;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.card,
          backgroundColor: tone + '22',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.sm,
        }}
      >
        <Ionicons name={INCIDENT_ICONS[incident.type]} size={19} color={tone} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodySm" weight="semibold" numberOfLines={1}>
          {t(`incident.types.${incident.type}`)}
          {incident.roadName ? ` · ${incident.roadName}` : ''}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <ConfidenceBadge level={level} />
          <Text variant="caption" color={colors.inkMuted} style={{ marginLeft: 8 }}>
            {formatRelativeTime(incident.lastConfirmedAt, t)}
          </Text>
          {distanceLabel && (
            <Text variant="caption" color={colors.inkMuted} style={{ marginLeft: 8 }}>
              · {distanceLabel}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.inkMuted} />
    </Pressable>
  );
}
