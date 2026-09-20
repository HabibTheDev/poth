import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Incident } from '@/types/domain';
import { INCIDENT_ICONS } from './incidentMeta';

interface Props {
  incident: Incident;
  distanceMeters: number;
}

/** Section 19: upcoming road alert shown during turn-by-turn navigation. */
export function NavAlertBanner({ incident, distanceMeters }: Props) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();
  const translateY = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [translateY, incident.id]);

  const tone = incident.type === 'accident' || incident.type === 'road_blocked' ? colors.danger : colors.caution;
  const onTone = incident.type === 'accident' || incident.type === 'road_blocked' ? colors.onDanger : colors.onCaution;

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        backgroundColor: tone,
        borderRadius: radius.card,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        ...colors.shadow.floating,
      }}
    >
      <Ionicons name={INCIDENT_ICONS[incident.type]} size={20} color={onTone} style={{ marginRight: 10 }} />
      <Text variant="bodySm" weight="semibold" color={onTone} style={{ flex: 1 }}>
        {t('navigation.alertAhead', { type: t(`incident.types.${incident.type}`), distance: Math.round(distanceMeters) })}
      </Text>
    </Animated.View>
  );
}
