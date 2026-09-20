/**
 * Poth design tokens.
 *
 * Palette is grounded in the product, not a generic default:
 * - Ink / Mist: driving-app surfaces (dark = glare-safe night driving, light = daytime glance)
 * - Jade: brand + "go" state, evokes Bangladesh's green without being a flag cliché
 * - Marigold: caution / hazard, evokes turmeric & marigold garlands sold roadside
 * - Brick: danger / critical incident only — never used as a brand-wide accent
 * - Steel: quiet informational tag color, used sparingly
 */

export const palette = {
  ink950: '#070B11',
  ink900: '#0B121C',
  ink800: '#141D2A',
  ink700: '#1E2A3B',
  ink600: '#2B394E',
  ink500: '#3E4F68',
  ink400: '#5C6E88',
  ink300: '#8798AC',
  ink200: '#B7C2D1',
  ink100: '#DCE3EA',

  mist50: '#F1F4F1',
  mist100: '#E7ECE7',
  mist0: '#FFFFFF',

  jade700: '#0E6455',
  jade600: '#14806A',
  jade500: '#1C9A80',
  jade400: '#3FB89D',
  jade200: '#B9E4D9',
  jade100: '#DEF2EC',

  marigold600: '#C6851F',
  marigold500: '#E8A33D',
  marigold400: '#F0B95F',
  marigold100: '#FCEACB',

  brick600: '#A5361F',
  brick500: '#C6432F',
  brick400: '#DD6249',
  brick100: '#F7DAD2',

  steel600: '#365A6E',
  steel500: '#4A7A94',
  steel400: '#6D97AC',
  steel100: '#DCE7EC',
} as const;

export type ThemeMode = 'light' | 'dark';

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  chip: 10,
  card: 14,
  control: 16,
  sheet: 24,
  pill: 999,
} as const;

export const motion = {
  fast: 140,
  base: 220,
  slow: 340,
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

export const touchTarget = {
  min: 44,
  comfortable: 56,
  primary: 64,
};

function shadowFor(mode: ThemeMode) {
  const shadowColor = mode === 'dark' ? '#000000' : '#1B2430';
  return {
    none: {},
    sheet: {
      shadowColor,
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: mode === 'dark' ? 0.5 : 0.14,
      shadowRadius: 20,
      elevation: 12,
    },
    floating: {
      shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: mode === 'dark' ? 0.45 : 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
    soft: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: mode === 'dark' ? 0.3 : 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
  };
}

export const lightColors = {
  mode: 'light' as ThemeMode,
  bg: palette.mist50,
  bgElevated: palette.mist0,
  surface: palette.mist0,
  surfaceAlt: palette.mist100,
  ink: palette.ink900,
  inkSubtle: palette.ink500,
  inkMuted: palette.ink400,
  hairline: '#DBE2E1',
  overlay: 'rgba(11,18,28,0.45)',
  scrim: 'rgba(11,18,28,0.06)',

  brand: palette.jade600,
  brandStrong: palette.jade700,
  brandSubtle: palette.jade100,
  onBrand: palette.mist0,

  caution: palette.marigold500,
  cautionSubtle: palette.marigold100,
  onCaution: palette.ink900,

  danger: palette.brick500,
  dangerSubtle: palette.brick100,
  onDanger: palette.mist0,

  info: palette.steel500,
  infoSubtle: palette.steel100,
  onInfo: palette.mist0,

  mapChromeBg: 'rgba(255,255,255,0.92)',
  shadow: shadowFor('light'),
};

export const darkColors = {
  mode: 'dark' as ThemeMode,
  bg: palette.ink900,
  bgElevated: palette.ink800,
  surface: palette.ink800,
  surfaceAlt: palette.ink700,
  ink: palette.mist50,
  inkSubtle: palette.ink200,
  inkMuted: palette.ink300,
  hairline: palette.ink600,
  overlay: 'rgba(7,11,17,0.6)',
  scrim: 'rgba(255,255,255,0.06)',

  brand: palette.jade500,
  brandStrong: palette.jade400,
  brandSubtle: 'rgba(28,154,128,0.18)',
  onBrand: palette.ink950,

  caution: palette.marigold500,
  cautionSubtle: 'rgba(232,163,61,0.18)',
  onCaution: palette.ink950,

  danger: palette.brick400,
  dangerSubtle: 'rgba(198,67,47,0.22)',
  onDanger: palette.ink950,

  info: palette.steel400,
  infoSubtle: 'rgba(74,122,148,0.22)',
  onInfo: palette.ink950,

  mapChromeBg: 'rgba(11,18,28,0.86)',
  shadow: shadowFor('dark'),
};

export type ThemeColors = typeof lightColors;
