import React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { Place, PlaceCategory } from '@/types/domain';

const ICONS: Record<PlaceCategory, keyof typeof Ionicons.glyphMap> = {
  fuel_station: 'water',
  mechanic: 'build',
  hospital: 'medkit',
  police: 'shield',
  saved: 'bookmark',
};

interface Props {
  place: Place;
  onPress?: (place: Place) => void;
}

export function PlaceMarker({ place, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Marker coordinate={place.location} onPress={() => onPress?.(place)} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.hairline,
          alignItems: 'center',
          justifyContent: 'center',
          ...colors.shadow.soft,
        }}
      >
        <Ionicons name={ICONS[place.category]} size={15} color={colors.inkSubtle} />
      </View>
    </Marker>
  );
}
