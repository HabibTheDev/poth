import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Vehicle } from '@/types/domain';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  motorcycle: 'bicycle',
  car: 'car-sport',
  suv: 'car-sport',
  truck: 'bus',
  cng: 'car',
  microbus: 'bus',
  bicycle: 'bicycle',
  other: 'help-circle',
};

interface Props {
  vehicle: Vehicle;
  onPress?: () => void;
}

export function VehicleCard({ vehicle, onPress }: Props) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();
  const fuelPct = Math.round((vehicle.currentFuelLiters / vehicle.tankCapacityLiters) * 100);

  return (
    <Pressable onPress={onPress}>
      <Card style={{ marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.card,
              backgroundColor: colors.brandSubtle,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.sm,
            }}
          >
            <Ionicons name={TYPE_ICONS[vehicle.type]} size={22} color={colors.brandStrong} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text variant="body" weight="semibold">
                {vehicle.brand} {vehicle.model}
              </Text>
              {vehicle.isDefault && (
                <View
                  style={{
                    marginLeft: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: radius.pill,
                    backgroundColor: colors.brandSubtle,
                  }}
                >
                  <Text variant="micro" weight="semibold" color={colors.brandStrong}>
                    {t('vehicle.setDefault')}
                  </Text>
                </View>
              )}
            </View>
            <Text variant="caption" color={colors.inkMuted} style={{ marginTop: 2 }}>
              {vehicle.mileageKmPerLiter} {t('common.km')}/L · {fuelPct}% {t('vehicle.currentFuel').toLowerCase()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
        </View>
      </Card>
    </Pressable>
  );
}
