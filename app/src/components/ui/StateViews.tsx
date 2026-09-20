import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';
import { Button } from './Button';

interface StateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'danger';
}

export function EmptyState({ icon, title, body, actionLabel, onAction }: StateProps) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.md,
        }}
      >
        <Ionicons name={icon} size={26} color={colors.inkMuted} />
      </View>
      <Text variant="h3" weight="semibold" align="center" style={{ marginBottom: 6 }}>
        {title}
      </Text>
      {body && (
        <Text variant="bodySm" color={colors.inkMuted} align="center" style={{ maxWidth: 280 }}>
          {body}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="secondary" size="sm" style={{ marginTop: spacing.lg }} />
      )}
    </View>
  );
}

export function ErrorState({ icon = 'alert-circle-outline', title, body, actionLabel, onAction }: StateProps) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.dangerSubtle,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.md,
        }}
      >
        <Ionicons name={icon} size={26} color={colors.danger} />
      </View>
      <Text variant="h3" weight="semibold" align="center" style={{ marginBottom: 6 }}>
        {title}
      </Text>
      {body && (
        <Text variant="bodySm" color={colors.inkMuted} align="center" style={{ maxWidth: 280 }}>
          {body}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="primary" size="sm" style={{ marginTop: spacing.lg }} />
      )}
    </View>
  );
}
