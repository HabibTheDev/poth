import React from 'react';
import { Pressable, ActivityIndicator, View, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  haptics?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading,
  disabled,
  fullWidth,
  style,
  haptics = true,
}: Props) {
  const { colors, radius } = useTheme();

  const heights = { sm: 40, md: 52, lg: 60 };
  const fontSizes = { sm: 'bodySm', md: 'body', lg: 'h3' } as const;
  const paddingX = { sm: 14, md: 20, lg: 24 };

  const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.brand, fg: colors.onBrand },
    secondary: { bg: colors.surfaceAlt, fg: colors.ink, border: colors.hairline },
    ghost: { bg: 'transparent', fg: colors.brand },
    danger: { bg: colors.danger, fg: colors.onDanger },
    inverse: { bg: colors.bgElevated, fg: colors.ink },
  };

  const p = palette[variant];

  const handlePress = () => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: paddingX[size],
          backgroundColor: p.bg,
          borderRadius: radius.control,
          borderWidth: p.border ? 1 : 0,
          borderColor: p.border,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={size === 'lg' ? 22 : 18} color={p.fg} style={{ marginRight: 8 }} />
          )}
          <Text variant={fontSizes[size]} weight="semibold" color={p.fg}>
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={size === 'lg' ? 22 : 18} color={p.fg} style={{ marginLeft: 8 }} />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
