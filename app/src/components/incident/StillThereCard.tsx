import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Incident } from '@/types/domain';
import { INCIDENT_ICONS } from './incidentMeta';

interface Props {
  incident: Incident;
  onConfirm: (stillActive: boolean) => void;
}

/** Section 14: near-zero-friction "still there?" confirmation while navigating. */
export function StillThereCard({ incident, onConfirm }: Props) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();

  return (
    <View
      style={{
        backgroundColor: colors.bgElevated,
        borderRadius: radius.sheet,
        padding: spacing.lg,
        ...colors.shadow.floating,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.cautionSubtle,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.sm,
          }}
        >
          <Ionicons name={INCIDENT_ICONS[incident.type]} size={18} color={colors.caution} />
        </View>
        <Text variant="body" weight="semibold" style={{ flex: 1 }}>
          {t(`incident.types.${incident.type}`)}
        </Text>
      </View>
      <Text variant="h3" weight="bold" style={{ marginBottom: 2 }}>
        {t('navigation.stillThere')}
      </Text>
      <Text variant="bodySm" color={colors.inkMuted} style={{ marginBottom: spacing.md }}>
        {t('navigation.confirmPrompt')}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <Button
          label={t('common.no')}
          variant="secondary"
          onPress={() => onConfirm(false)}
          style={{ flex: 1, marginRight: spacing.sm }}
        />
        <Button label={t('common.yes')} variant="primary" onPress={() => onConfirm(true)} style={{ flex: 1 }} />
      </View>
    </View>
  );
}
