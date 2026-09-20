import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'neutral' | 'brand' | 'caution' | 'danger';
}

export function Chip({ label, selected, onPress, icon, tone = 'neutral' }: Props) {
  const { colors, radius, spacing } = useTheme();

  const toneColors = {
    neutral: { bg: colors.surfaceAlt, fg: colors.inkSubtle, activeBg: colors.ink, activeFg: colors.bg },
    brand: { bg: colors.brandSubtle, fg: colors.brandStrong, activeBg: colors.brand, activeFg: colors.onBrand },
    caution: { bg: colors.cautionSubtle, fg: colors.caution, activeBg: colors.caution, activeFg: colors.onCaution },
    danger: { bg: colors.dangerSubtle, fg: colors.danger, activeBg: colors.danger, activeFg: colors.onDanger },
  }[tone];

  const content = (
    <>
      {icon && (
        <Ionicons
          name={icon}
          size={15}
          color={selected ? toneColors.activeFg : toneColors.fg}
          style={{ marginRight: 6 }}
        />
      )}
      <Text variant="bodySm" weight="medium" color={selected ? toneColors.activeFg : toneColors.fg}>
        {label}
      </Text>
    </>
  );

  const baseStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.chip,
    backgroundColor: selected ? toneColors.activeBg : toneColors.bg,
  };

  if (!onPress) {
    return <View style={baseStyle}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [baseStyle, { opacity: pressed ? 0.85 : 1 }]}
    >
      {content}
    </Pressable>
  );
}
