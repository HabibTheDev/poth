import { create } from 'zustand';
import { Vehicle } from '@/types/domain';
import { services } from '@/services';

interface VehicleState {
  vehicles: Vehicle[];
  status: 'idle' | 'loading' | 'loaded' | 'error';
  fetch: () => Promise<void>;
  addVehicle: (v: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  activeVehicle: () => Vehicle | undefined;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  status: 'idle',

  fetch: async () => {
    set({ status: 'loading' });
    try {
      const vehicles = await services.vehicles.list();
      set({ vehicles, status: 'loaded' });
    } catch {
      set({ status: 'error' });
    }
  },

  addVehicle: async (v) => {
    const created = await services.vehicles.add(v);
    set((state) => ({
      vehicles: created.isDefault
        ? [...state.vehicles.map((x) => ({ ...x, isDefault: false })), created]
        : [...state.vehicles, created],
    }));
  },

  updateVehicle: async (id, patch) => {
    const updated = await services.vehicles.update(id, patch);
    set((state) => ({ vehicles: state.vehicles.map((v) => (v.id === id ? updated : v)) }));
  },

  removeVehicle: async (id) => {
    await services.vehicles.remove(id);
    set((state) => ({ vehicles: state.vehicles.filter((v) => v.id !== id) }));
  },

  setDefault: async (id) => {
    await services.vehicles.setDefault(id);
    set((state) => ({
      vehicles: state.vehicles.map((v) => ({ ...v, isDefault: v.id === id })),
    }));
  },

  activeVehicle: () => get().vehicles.find((v) => v.isDefault) ?? get().vehicles[0],
}));
