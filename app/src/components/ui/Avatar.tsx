import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

const PALETTE_KEYS = ['brand', 'caution', 'info', 'danger'] as const;

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const { colors } = useTheme();
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const hash = name.charCodeAt(0) % PALETTE_KEYS.length;
  const key = PALETTE_KEYS[hash];
  const bg = { brand: colors.brandSubtle, caution: colors.cautionSubtle, info: colors.infoSubtle, danger: colors.dangerSubtle }[key];
  const fg = { brand: colors.brandStrong, caution: colors.caution, info: colors.info, danger: colors.danger }[key];

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text variant="bodySm" weight="bold" color={fg}>
        {initials}
      </Text>
    </View>
  );
}
