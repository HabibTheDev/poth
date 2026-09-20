import React, { useState } from 'react';
import { TextInput, View, TextInputProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { resolveFontFamily } from '@/theme/typography';
import { Text } from './Text';

interface Props extends TextInputProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  suffix?: string;
}

export function Input({ label, helperText, errorText, suffix, style, ...rest }: Props) {
  const { colors, radius, spacing } = useTheme();
  const { locale } = useI18n();
  const [focused, setFocused] = useState(false);
  const fontFamily = resolveFontFamily(locale, 'regular');

  return (
    <View>
      {label && (
        <Text variant="bodySm" weight="medium" color={colors.inkSubtle} style={{ marginBottom: 6 }}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: errorText ? colors.danger : focused ? colors.brand : colors.hairline,
          borderRadius: radius.control,
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.md,
          height: 56,
        }}
      >
        <TextInput
          placeholderTextColor={colors.inkMuted}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[{ flex: 1, fontFamily, fontSize: 16, color: colors.ink }, style]}
          {...rest}
        />
        {suffix && (
          <Text variant="bodySm" color={colors.inkMuted}>
            {suffix}
          </Text>
        )}
      </View>
      {(helperText || errorText) && (
        <Text
          variant="caption"
          color={errorText ? colors.danger : colors.inkMuted}
          style={{ marginTop: 6 }}
        >
          {errorText ?? helperText}
        </Text>
      )}
    </View>
  );
}
