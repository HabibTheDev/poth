import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from './Text';
import { ConfidenceLevel } from '@/types/domain';

interface Props {
  level: ConfidenceLevel;
  compact?: boolean;
}

export function ConfidenceBadge({ level, compact }: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    if (level === 'high') loop.start();
    return () => loop.stop();
  }, [level, pulse]);

  const dotColor = level === 'high' ? colors.brand : level === 'medium' ? colors.caution : colors.inkMuted;
  const label = t(`incident.confidence${level.charAt(0).toUpperCase()}${level.slice(1)}`);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Animated.View
        style={{
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: dotColor,
          opacity: level === 'high' ? pulse : 1,
          marginRight: 6,
        }}
      />
      {!compact && (
        <Text variant="caption" weight="medium" color={colors.inkMuted}>
          {label}
        </Text>
      )}
    </View>
  );
}
