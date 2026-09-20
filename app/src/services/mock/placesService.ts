import { PlacesService } from '../types';
import { mockPlaces } from '@/mocks/dhaka';
import { haversineKm } from '@/utils/geo';
import { delay } from './util';

export const mockPlacesService: PlacesService = {
  async listNearby(center, category) {
    const filtered = mockPlaces
      .filter((p) => !category || p.category === category)
      .filter((p) => haversineKm(center, p.location) <= 5)
      .sort((a, b) => haversineKm(center, a.location) - haversineKm(center, b.location));
    return delay(filtered, 400);
  },
};
