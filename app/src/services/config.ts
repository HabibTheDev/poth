// Centralized configuration values. In production these would be
// fetched from the backend's /api/v1/admin/config (or similar) so
// they can change without a client release — kept as constants here
// since there is no backend connected yet.

export const config = {
  fuelPriceBdtPerLiter: {
    petrol: 125,
    octane: 130,
    diesel: 109,
    cng: 43,
    electric: 12, // approximate BDT equivalent per "liter" of range for electric vehicles
  },
  defaultTollBdt: 0,
  defaultParkingBdt: 30,
  incidentAlertDistanceMeters: {
    default: 300,
    accident: 500,
    road_blocked: 400,
    waterlogging: 350,
    pothole: 150,
    police: 250,
  } as Record<string, number>,
  nearbyIncidentRadiusKm: 3,
  reportMergeRadiusKm: 0.15,
};
