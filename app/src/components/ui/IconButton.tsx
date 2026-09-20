import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  variant?: 'floating' | 'flat' | 'brand';
  accessibilityLabel: string;
  style?: ViewStyle;
}

export function IconButton({ icon, onPress, size = 48, variant = 'floating', accessibilityLabel, style }: Props) {
  const { colors, radius } = useTheme();

  const bg =
    variant === 'brand' ? colors.brand : variant === 'flat' ? 'transparent' : colors.mapChromeBg;
  const fg = variant === 'brand' ? colors.onBrand : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
        },
        variant === 'floating' ? colors.shadow.floating : undefined,
        style,
      ]}
    >
      <Ionicons name={icon} size={size * 0.46} color={fg} />
    </Pressable>
  );
}
