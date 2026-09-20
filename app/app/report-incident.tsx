import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { INCIDENT_TYPES, INCIDENT_ICONS } from '@/components/incident/incidentMeta';
import { IncidentType } from '@/types/domain';
import { services } from '@/services';
import { useLocation } from '@/hooks/useLocation';

export default function ReportIncident() {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { coords } = useLocation();

  const [selected, setSelected] = useState<IncidentType | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await services.incidents.report({ type: selected, location: coords, description: note || undefined });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
      setTimeout(() => router.back(), 900);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.brandSubtle,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
          }}
        >
          <Ionicons name="checkmark" size={36} color={colors.brand} />
        </View>
        <Text variant="h3" weight="semibold">
          {t('incident.submitted')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text variant="h2" weight="bold">
            {t('incident.reportTitle')}
          </Text>
          <Text variant="bodySm" color={colors.inkMuted}>
            {t('incident.reportSubtitle')}
          </Text>
        </View>
        <IconButton icon="close" accessibilityLabel={t('common.cancel')} variant="flat" onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs }}>
          {INCIDENT_TYPES.map((type) => {
            const active = selected === type;
            return (
              <Pressable
                key={type}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelected(type);
                }}
                style={{ width: '33.33%', padding: spacing.xs }}
              >
                <View
                  style={{
                    alignItems: 'center',
                    paddingVertical: spacing.md,
                    borderRadius: radius.card,
                    borderWidth: active ? 2 : 1,
                    borderColor: active ? colors.brand : colors.hairline,
                    backgroundColor: active ? colors.brandSubtle : colors.surface,
                  }}
                >
                  <Ionicons name={INCIDENT_ICONS[type]} size={24} color={active ? colors.brandStrong : colors.inkSubtle} />
                  <Text
                    variant="micro"
                    weight="medium"
                    align="center"
                    color={active ? colors.brandStrong : colors.inkSubtle}
                    style={{ marginTop: 6 }}
                    numberOfLines={2}
                  >
                    {t(`incident.types.${type}`)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <Input
            placeholder={t('incident.addNote')}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md }}>
        <Button
          label={t('incident.submit')}
          onPress={handleSubmit}
          disabled={!selected}
          loading={submitting}
          size="lg"
          fullWidth
        />
      </View>
    </View>
  );
}
