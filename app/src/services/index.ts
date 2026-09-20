import { mockAuthService } from './mock/authService';
import { mockVehicleService } from './mock/vehicleService';
import { mockIncidentService } from './mock/incidentService';
import { mockFuelService } from './mock/fuelService';
import { mockTripService } from './mock/tripService';
import { mockPlacesService } from './mock/placesService';
import { mockCommunityService } from './mock/communityService';
import { mockNavigationService } from './mock/navigationService';

// Screens and stores should only ever import `services` from this
// file, never a concrete mock/* or real/* module directly. When the
// backend described in the spec is ready, add a `src/services/real/*`
// implementation of each interface in ./types (backed by apiClient)
// and flip the export below — no other file in the app needs to change.
const USE_MOCK_API = true;

export const services = {
  auth: mockAuthService,
  vehicles: mockVehicleService,
  incidents: mockIncidentService,
  fuel: mockFuelService,
  trips: mockTripService,
  places: mockPlacesService,
  community: mockCommunityService,
  navigation: mockNavigationService,
};

export { USE_MOCK_API };
export * from './types';
