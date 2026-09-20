import { z } from 'zod';

const createFuelRecordSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1, 'Vehicle ID is required'),
    tripId: z.string().optional(),
    fuelType: z.enum(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'ETHANOL', 'HYDROGEN']),
    amount: z.number().positive('Amount must be positive'),
    cost: z.number().positive('Cost must be positive'),
    vehicleMileage: z.number().positive().optional(),
    odometerReading: z.number().positive().optional(),
    stationName: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const FuelValidation = {
  createFuelRecordSchema,
};
