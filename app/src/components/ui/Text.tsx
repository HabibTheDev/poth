import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { resolveFontFamily, typeScale, TypeScaleKey, FontWeightRole } from '@/theme/typography';

interface Props extends TextProps {
  variant?: TypeScaleKey;
  weight?: FontWeightRole;
  display?: boolean; // use display family (Sora) even in English body contexts
  color?: string;
  align?: TextStyle['textAlign'];
}

export function Text({
  variant = 'body',
  weight = 'regular',
  display = false,
  color,
  align,
  style,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const { locale } = useI18n();

  const isDisplayVariant = display || variant === 'display' || variant === 'h1' || variant === 'bigStat' || variant === 'midStat';
  const fontFamily = resolveFontFamily(locale, weight, isDisplayVariant);

  return (
    <RNText
      style={[
        typeScale[variant],
        { fontFamily, color: color ?? colors.ink, textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}
