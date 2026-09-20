import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '@/theme/ThemeProvider';
import { LatLng } from '@/types/domain';

/** Current-location puck with a soft breathing halo — reads as "live". */
export function UserPuck({ coordinate, heading }: { coordinate: LatLng; heading?: number }) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.7, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} flat rotation={heading ?? 0} tracksViewChanges={false}>
      <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: colors.brand,
            opacity: 0.25,
            transform: [{ scale }],
          }}
        />
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: colors.brand,
            borderWidth: 3,
            borderColor: colors.bg,
          }}
        />
      </View>
    </Marker>
  );
}
