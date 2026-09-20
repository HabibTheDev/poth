import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

interface Option {
  key: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (key: string) => void;
}

export function SegmentedTabs({ options, value, onChange }: Props) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.control,
        padding: 4,
      }}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: radius.control - 4,
              backgroundColor: active ? colors.surface : 'transparent',
              alignItems: 'center',
              ...(active ? colors.shadow.soft : {}),
            }}
          >
            <Text variant="bodySm" weight={active ? 'semibold' : 'medium'} color={active ? colors.ink : colors.inkMuted}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
