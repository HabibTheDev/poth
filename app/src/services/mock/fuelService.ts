import { FuelService } from '../types';
import { delay } from './util';

export const mockFuelService: FuelService = {
  async estimate({ distanceKm, mileageKmPerLiter, fuelAvailableLiters, tankCapacityLiters }) {
    const fuelRequiredLiters = Number((distanceKm / mileageKmPerLiter).toFixed(2));
    const canReach = fuelAvailableLiters >= fuelRequiredLiters;
    const estimatedRemainingLiters = Number(
      Math.max(0, fuelAvailableLiters - fuelRequiredLiters).toFixed(2)
    );

    if (canReach) {
      return delay(
        {
          distanceKm,
          mileageKmPerLiter,
          fuelAvailableLiters,
          fuelRequiredLiters,
          canReach: true,
          estimatedRemainingLiters,
        },
        350
      );
    }

    const shortfallLiters = Number((fuelRequiredLiters - fuelAvailableLiters).toFixed(2));
    const reachableKm = fuelAvailableLiters * mileageKmPerLiter;
    // Suggest a stop a little before the tank would actually run dry.
    const recommendedStopAtKm = Math.max(0, Math.round(reachableKm * 0.85));

    return delay(
      {
        distanceKm,
        mileageKmPerLiter,
        fuelAvailableLiters,
        fuelRequiredLiters,
        canReach: false,
        estimatedRemainingLiters: 0,
        shortfallLiters,
        recommendedStopAtKm,
      },
      350
    );
  },
};
