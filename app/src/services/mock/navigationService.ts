import { NavigationService } from '../types';
import { LatLng, RouteOption, RoutePreference } from '@/types/domain';
import { haversineKm } from '@/utils/geo';
import { config } from '../config';
import { delay, uid } from './util';

// No real RoutingProvider is connected yet (see spec section 44 —
// Map/Routing/Geocoding/Places/Traffic providers should sit behind
// interfaces like this one). This generates plausible-looking route
// options and a gently-jittered polyline so the UI is fully wired
// and only the provider implementation needs to change later.

function jitteredPoint(a: LatLng, b: LatLng, t: number, seed: number): LatLng {
  const lat = a.latitude + (b.latitude - a.latitude) * t;
  const lng = a.longitude + (b.longitude - a.longitude) * t;
  const wobble = Math.sin(t * Math.PI * seed) * 0.0025 * Math.sin(t * Math.PI);
  return { latitude: lat + wobble, longitude: lng - wobble * 0.6 };
}

export const mockNavigationService: NavigationService = {
  async getRouteOptions(origin, destination) {
    const straightKm = haversineKm(origin, destination);
    const roadFactor = 1.35; // roads are never straight lines
    const baseKm = straightKm * roadFactor;

    const options: RouteOption[] = [
      {
        id: uid('route'),
        preference: 'fastest',
        distanceKm: Number(baseKm.toFixed(1)),
        durationMin: Math.round((baseKm / 22) * 60),
        fuelCostBdt: Math.round((baseKm / 35) * config.fuelPriceBdtPerLiter.petrol),
        riskScore: 4,
        roadQualityScore: 7,
      },
      {
        id: uid('route'),
        preference: 'cheapest',
        distanceKm: Number((baseKm * 0.94).toFixed(1)),
        durationMin: Math.round(((baseKm * 0.94) / 18) * 60),
        fuelCostBdt: Math.round(((baseKm * 0.94) / 40) * config.fuelPriceBdtPerLiter.petrol),
        riskScore: 5,
        roadQualityScore: 6,
      },
      {
        id: uid('route'),
        preference: 'safest',
        distanceKm: Number((baseKm * 1.12).toFixed(1)),
        durationMin: Math.round(((baseKm * 1.12) / 20) * 60),
        fuelCostBdt: Math.round(((baseKm * 1.12) / 35) * config.fuelPriceBdtPerLiter.petrol),
        riskScore: 2,
        roadQualityScore: 8,
      },
      {
        id: uid('route'),
        preference: 'best_road',
        distanceKm: Number((baseKm * 1.05).toFixed(1)),
        durationMin: Math.round(((baseKm * 1.05) / 21) * 60),
        fuelCostBdt: Math.round(((baseKm * 1.05) / 36) * config.fuelPriceBdtPerLiter.petrol),
        riskScore: 3,
        roadQualityScore: 9,
      },
    ];

    return delay(options, 550);
  },

  async getRoutePolyline(origin, destination, preference) {
    const seed = { fastest: 3, cheapest: 5, safest: 2, best_road: 4 }[preference] ?? 3;
    const points: LatLng[] = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      points.push(jitteredPoint(origin, destination, i / steps, seed));
    }
    return delay(points, 300);
  },
};
