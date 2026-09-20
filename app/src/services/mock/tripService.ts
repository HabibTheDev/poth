import { TripService } from '../types';
import { mockTrips } from '@/mocks/dhaka';
import { config } from '../config';
import { delay } from './util';

export const mockTripService: TripService = {
  async estimateCost({ distanceKm, mileageKmPerLiter }) {
    const litersNeeded = distanceKm / mileageKmPerLiter;
    const fuelCostBdt = Math.round(litersNeeded * config.fuelPriceBdtPerLiter.petrol);
    const tollCostBdt = config.defaultTollBdt;
    const parkingCostBdt = config.defaultParkingBdt;
    const totalBdt = fuelCostBdt + tollCostBdt + parkingCostBdt;

    return delay({ distanceKm, fuelCostBdt, tollCostBdt, parkingCostBdt, totalBdt }, 350);
  },

  async listHistory(vehicleId) {
    const trips = vehicleId ? mockTrips.filter((t) => t.vehicleId === vehicleId) : mockTrips;
    return delay([...trips], 400);
  },
};
