import { TextStyle } from 'react-native';

/**
 * Two-family type system:
 * - Sora: display type — wordmark, screen titles, and the big glanceable numbers
 *   (ETA, distance, fuel) a rider reads in a half-second glance.
 * - Plus Jakarta Sans: UI/body type — labels, paragraphs, buttons.
 * - Noto Sans Bengali: swapped in for both roles when locale is 'bn' so Bangla
 *   never feels like a bolted-on afterthought.
 */

export const fontFamilies = {
  displayRegular: 'Sora_400Regular',
  displayMedium: 'Sora_500Medium',
  displaySemibold: 'Sora_600SemiBold',
  displayBold: 'Sora_700Bold',

  uiRegular: 'PlusJakartaSans_400Regular',
  uiMedium: 'PlusJakartaSans_500Medium',
  uiSemibold: 'PlusJakartaSans_600SemiBold',
  uiBold: 'PlusJakartaSans_700Bold',

  bnRegular: 'NotoSansBengali_400Regular',
  bnMedium: 'NotoSansBengali_500Medium',
  bnSemibold: 'NotoSansBengali_600SemiBold',
  bnBold: 'NotoSansBengali_700Bold',
} as const;

export type FontWeightRole = 'regular' | 'medium' | 'semibold' | 'bold';

export function resolveFontFamily(locale: 'en' | 'bn', role: FontWeightRole, display = false) {
  if (locale === 'bn') {
    return {
      regular: fontFamilies.bnRegular,
      medium: fontFamilies.bnMedium,
      semibold: fontFamilies.bnSemibold,
      bold: fontFamilies.bnBold,
    }[role];
  }
  if (display) {
    return {
      regular: fontFamilies.displayRegular,
      medium: fontFamilies.displayMedium,
      semibold: fontFamilies.displaySemibold,
      bold: fontFamilies.displayBold,
    }[role];
  }
  return {
    regular: fontFamilies.uiRegular,
    medium: fontFamilies.uiMedium,
    semibold: fontFamilies.uiSemibold,
    bold: fontFamilies.uiBold,
  }[role];
}

// Base (English) type scale. Bangla strings tend to run ~10-15% longer, so
// components should wrap rather than truncate wherever possible.
export const typeScale = {
  display: { fontSize: 34, lineHeight: 40, letterSpacing: -0.4 },
  h1: { fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  h2: { fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  h3: { fontSize: 18, lineHeight: 24, letterSpacing: -0.1 },
  bigStat: { fontSize: 44, lineHeight: 48, letterSpacing: -0.6 },
  midStat: { fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  body: { fontSize: 16, lineHeight: 23, letterSpacing: 0 },
  bodySm: { fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
  micro: { fontSize: 11, lineHeight: 14, letterSpacing: 0.15 },
} satisfies Record<string, TextStyle>;

export type TypeScaleKey = keyof typeof typeScale;
