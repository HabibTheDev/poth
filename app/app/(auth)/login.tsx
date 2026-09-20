import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LogoMark } from '@/components/brand/Logo';
import { services } from '@/services';

export default function Login() {
  const { colors, spacing } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const canContinue = phone.replace(/\D/g, '').length >= 11;

  const handleContinue = async () => {
    if (!canContinue) {
      setError(t('auth.phonePlaceholder'));
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const { requestId } = await services.auth.requestOtp(phone);
      router.push({ pathname: '/(auth)/verify', params: { requestId, phone, mode: 'signin' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, paddingTop: insets.top + spacing.xxl, paddingHorizontal: spacing.xl }}>
        <LogoMark size={56} />
        <Text variant="h1" weight="bold" style={{ marginTop: spacing.xl, marginBottom: spacing.xs }}>
          {t('auth.welcomeBack')}
        </Text>
        <Text variant="body" color={colors.inkMuted} style={{ marginBottom: spacing.xl }}>
          {t('common.tagline')}
        </Text>

        <Input
          label={t('auth.phoneLabel')}
          placeholder={t('auth.phonePlaceholder')}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          errorText={error}
          autoFocus
        />

        <Button
          label={t('auth.continue')}
          onPress={handleContinue}
          loading={loading}
          size="lg"
          fullWidth
          style={{ marginTop: spacing.lg }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
          <Text variant="bodySm" color={colors.inkMuted}>
            {t('auth.noAccount')}{' '}
          </Text>
          <Text
            variant="bodySm"
            weight="semibold"
            color={colors.brand}
            onPress={() => router.push('/(auth)/signup')}
          >
            {t('auth.signUp')}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
