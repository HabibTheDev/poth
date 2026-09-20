import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { services } from '@/services';

export default function Signup() {
  const { colors, spacing } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const canContinue = name.trim().length > 1 && phone.replace(/\D/g, '').length >= 11;

  const handleContinue = async () => {
    if (!canContinue) return;
    setLoading(true);
    try {
      const { requestId } = await services.auth.requestOtp(phone);
      router.push({ pathname: '/(auth)/verify', params: { requestId, phone, name, mode: 'signup' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="" transparent onBack={() => router.back()} />
      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
        <Text variant="h1" weight="bold" style={{ marginBottom: spacing.xs }}>
          {t('auth.createAccount')}
        </Text>
        <Text variant="body" color={colors.inkMuted} style={{ marginBottom: spacing.xl }}>
          {t('common.tagline')}
        </Text>

        <Input
          label={t('auth.nameLabel')}
          placeholder={t('auth.namePlaceholder')}
          value={name}
          onChangeText={setName}
          style={{ marginBottom: spacing.md }}
          autoFocus
        />
        <Input
          label={t('auth.phoneLabel')}
          placeholder={t('auth.phonePlaceholder')}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Button
          label={t('auth.continue')}
          onPress={handleContinue}
          loading={loading}
          disabled={!canContinue}
          size="lg"
          fullWidth
          style={{ marginTop: spacing.lg }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
          <Text variant="bodySm" color={colors.inkMuted}>
            {t('auth.haveAccount')}{' '}
          </Text>
          <Text variant="bodySm" weight="semibold" color={colors.brand} onPress={() => router.back()}>
            {t('auth.signIn')}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
