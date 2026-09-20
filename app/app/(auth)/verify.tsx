import React, { useRef, useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { services } from '@/services';
import { useAuthStore } from '@/store/authStore';

const CODE_LENGTH = 4;

export default function Verify() {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ requestId: string; phone: string; name?: string; mode: string }>();
  const setUser = useAuthStore((s) => s.setUser);

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const code = digits.join('');

  const handleChange = (value: string, i: number) => {
    const clean = value.replace(/\D/g, '');
    const next = [...digits];
    next[i] = clean.slice(-1);
    setDigits(next);
    if (clean && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const handleKeyPress = (key: string, i: number) => {
    if (key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    setError(undefined);
    setLoading(true);
    try {
      const { user } = await services.auth.verifyOtp(params.requestId, code, params.name);
      setUser(user);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message ?? t('errors.genericTitle'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="" transparent onBack={() => router.back()} />
      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
        <Text variant="h1" weight="bold" style={{ marginBottom: spacing.xs }}>
          {t('auth.verifyAndContinue')}
        </Text>
        <Text variant="body" color={colors.inkMuted} style={{ marginBottom: spacing.xl }}>
          {t('auth.otpSent', { phone: params.phone ?? '' })}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg }}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={d}
              onChangeText={(v) => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              style={{
                width: 60,
                height: 64,
                borderRadius: radius.control,
                borderWidth: 1.5,
                borderColor: error ? colors.danger : d ? colors.brand : colors.hairline,
                textAlign: 'center',
                fontSize: 24,
                color: colors.ink,
                backgroundColor: colors.surface,
              }}
            />
          ))}
        </View>

        {error && (
          <Text variant="bodySm" color={colors.danger} style={{ marginBottom: spacing.md }}>
            {error}
          </Text>
        )}

        <Button
          label={t('auth.verifyAndContinue')}
          onPress={handleVerify}
          loading={loading}
          disabled={code.length < CODE_LENGTH}
          size="lg"
          fullWidth
        />

        <Button
          label={t('auth.resend')}
          onPress={() => services.auth.requestOtp(params.phone ?? '')}
          variant="ghost"
          size="sm"
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
