import { VehicleService } from '../types';
import { mockVehicles } from '@/mocks/dhaka';
import { Vehicle } from '@/types/domain';
import { delay, uid } from './util';

let vehicles: Vehicle[] = [...mockVehicles];

export const mockVehicleService: VehicleService = {
  async list() {
    return delay([...vehicles], 400);
  },

  async add(input) {
    const vehicle: Vehicle = { ...input, id: uid('v') };
    if (vehicle.isDefault) {
      vehicles = vehicles.map((v) => ({ ...v, isDefault: false }));
    }
    vehicles = [...vehicles, vehicle];
    return delay(vehicle, 500);
  },

  async update(id, patch) {
    vehicles = vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v));
    const updated = vehicles.find((v) => v.id === id)!;
    return delay(updated, 400);
  },

  async remove(id) {
    vehicles = vehicles.filter((v) => v.id !== id);
    return delay(undefined, 300);
  },

  async setDefault(id) {
    vehicles = vehicles.map((v) => ({ ...v, isDefault: v.id === id }));
    return delay(undefined, 250);
  },
};
