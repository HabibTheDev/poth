import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';
import { IconButton } from './IconButton';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
}

export function ScreenHeader({ title, subtitle, onBack, right, transparent }: Props) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: spacing.sm,
        paddingHorizontal: spacing.lg,
        backgroundColor: transparent ? 'transparent' : colors.bg,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <IconButton
        icon="chevron-back"
        accessibilityLabel="Go back"
        variant="flat"
        size={40}
        onPress={onBack ?? (() => router.back())}
        style={{ marginLeft: -8 }}
      />
      <View style={{ flex: 1, marginLeft: 4 }}>
        <Text variant="h3" weight="semibold" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color={colors.inkMuted} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}
