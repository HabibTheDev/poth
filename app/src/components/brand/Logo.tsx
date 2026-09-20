import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/ui/Text';

/**
 * The mark: a single continuous stroke that bends twice — like a road
 * or river-delta curve — starting from a small hollow dot (your current
 * position) and resolving into a filled dot (destination). It sits in a
 * softly rounded square so it reads clearly as an app icon at any size.
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  const { colors, radius } = useTheme();
  const s = size;

  return (
    <View
      style={{
        width: s,
        height: s,
        borderRadius: s * (radius.control / 64),
        backgroundColor: colors.brand,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Svg width={s * 0.66} height={s * 0.66} viewBox="0 0 40 40" fill="none">
        <Path
          d="M8 10C8 10 18 10 18 18C18 26 30 22 30 30"
          stroke={colors.onBrand}
          strokeWidth={4.2}
          strokeLinecap="round"
        />
        <Circle cx="8" cy="10" r="3" fill="none" stroke={colors.onBrand} strokeWidth={2.4} />
        <Circle cx="30" cy="30" r="3.6" fill={colors.onBrand} />
      </Svg>
    </View>
  );
}

export function LogoLockup({ size = 40, tagline = false }: { size?: number; tagline?: boolean }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <LogoMark size={size} />
      <View style={{ marginLeft: spacing.sm }}>
        <Text variant="h2" weight="bold" display>
          Poth
        </Text>
        {tagline && (
          <Text variant="caption" color={colors.inkMuted} style={{ marginTop: -2 }}>
            Know the road ahead
          </Text>
        )}
      </View>
    </View>
  );
}

/** Simple flat square version for app-icon / splash generation contexts. */
export function LogoIconSquare({ size = 512 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect width="512" height="512" rx={size * 0.22} fill="#14806A" />
      <Path
        d="M112 132C112 132 232 132 232 224C232 316 384 276 384 372"
        stroke="#F1F4F1"
        strokeWidth={40}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="112" cy="132" r="26" fill="none" stroke="#F1F4F1" strokeWidth={22} />
      <Circle cx="384" cy="372" r="32" fill="#F1F4F1" />
    </Svg>
  );
}
