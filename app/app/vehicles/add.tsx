import React, { useState } from 'react';
import { View, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useVehicleStore } from '@/store/vehicleStore';
import { VehicleType, FuelType } from '@/types/domain';

const TYPES: { type: VehicleType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'motorcycle', icon: 'bicycle' },
  { type: 'car', icon: 'car-sport' },
  { type: 'suv', icon: 'car-sport' },
  { type: 'truck', icon: 'bus' },
  { type: 'cng', icon: 'car' },
  { type: 'microbus', icon: 'bus' },
  { type: 'bicycle', icon: 'bicycle' },
  { type: 'other', icon: 'help-circle' },
];

const FUEL_TYPES: FuelType[] = ['petrol', 'octane', 'diesel', 'cng', 'electric'];

export default function AddVehicle() {
  const { colors, spacing, radius } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const addVehicle = useVehicleStore((s) => s.addVehicle);

  const [type, setType] = useState<VehicleType>('motorcycle');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [tankCapacity, setTankCapacity] = useState('');
  const [mileage, setMileage] = useState('');
  const [odometer, setOdometer] = useState('');
  const [currentFuel, setCurrentFuel] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = brand && model && tankCapacity && mileage;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await addVehicle({
        type,
        brand,
        model,
        fuelType,
        tankCapacityLiters: Number(tankCapacity),
        mileageKmPerLiter: Number(mileage),
        odometerKm: Number(odometer) || 0,
        currentFuelLiters: Number(currentFuel) || 0,
        isDefault: false,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
          <Text variant="h3" weight="semibold" style={{ flex: 1 }}>
            {t('vehicle.addVehicle')}
          </Text>
          <IconButton icon="close" accessibilityLabel={t('common.cancel')} variant="flat" onPress={() => router.back()} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: spacing.md }}>
          {TYPES.map(({ type: ty, icon }) => {
            const active = type === ty;
            return (
              <Pressable key={ty} onPress={() => setType(ty)} style={{ width: '25%', padding: 4 }}>
                <View
                  style={{
                    alignItems: 'center',
                    paddingVertical: spacing.sm,
                    borderRadius: radius.card,
                    borderWidth: active ? 2 : 1,
                    borderColor: active ? colors.brand : colors.hairline,
                    backgroundColor: active ? colors.brandSubtle : colors.surface,
                  }}
                >
                  <Ionicons name={icon} size={20} color={active ? colors.brandStrong : colors.inkSubtle} />
                  <Text variant="micro" weight="medium" color={active ? colors.brandStrong : colors.inkSubtle} style={{ marginTop: 4 }}>
                    {t(`vehicle.types.${ty}`)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Input label={t('vehicle.brand')} value={brand} onChangeText={setBrand} placeholder="Yamaha" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label={t('vehicle.model')} value={model} onChangeText={setModel} placeholder="R15" />
          </View>
        </View>

        <Text variant="bodySm" weight="medium" color={colors.inkSubtle} style={{ marginBottom: 6 }}>
          {t('vehicle.fuelType')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md }}>
          {FUEL_TYPES.map((f) => {
            const active = fuelType === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFuelType(f)}
                style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 8,
                  borderRadius: radius.chip,
                  backgroundColor: active ? colors.brand : colors.surfaceAlt,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text variant="bodySm" weight="medium" color={active ? colors.onBrand : colors.inkSubtle}>
                  {t(`vehicle.${f}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Input
              label={t('vehicle.tankCapacity')}
              value={tankCapacity}
              onChangeText={setTankCapacity}
              keyboardType="numeric"
              suffix="L"
              placeholder="11"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label={t('vehicle.mileage')}
              value={mileage}
              onChangeText={setMileage}
              keyboardType="numeric"
              suffix="km/L"
              placeholder="38"
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Input
              label={t('vehicle.odometer')}
              value={odometer}
              onChangeText={setOdometer}
              keyboardType="numeric"
              suffix="km"
              placeholder="8420"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label={t('vehicle.currentFuel')}
              value={currentFuel}
              onChangeText={setCurrentFuel}
              keyboardType="numeric"
              suffix="L"
              placeholder="5.2"
            />
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md }}>
        <Button label={t('common.save')} onPress={handleSave} disabled={!canSave} loading={saving} size="lg" fullWidth />
      </View>
    </KeyboardAvoidingView>
  );
}
