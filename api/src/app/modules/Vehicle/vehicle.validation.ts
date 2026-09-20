import { z } from 'zod';

const createVehicleSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Vehicle name is required').max(100),
    brand: z.string().max(50).optional(),
    model: z.string().max(50).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 2).optional(),
    fuelType: z
      .enum(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'ETHANOL', 'HYDROGEN'])
      .optional(),
    fuelTankCapacity: z.number().positive().optional(),
    engineCapacity: z.number().positive().optional(),
    transmission: z.enum(['MANUAL', 'AUTOMATIC', 'CVT', 'SEMI_AUTOMATIC', 'UNKNOWN']).optional(),
    isPrimary: z.boolean().optional(),
    color: z.string().max(30).optional(),
    plateNumber: z.string().max(20).optional(),
  }),
});

const updateVehicleSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    brand: z.string().max(50).optional(),
    model: z.string().max(50).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 2).optional(),
    fuelType: z
      .enum(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'ETHANOL', 'HYDROGEN'])
      .optional(),
    fuelTankCapacity: z.number().positive().optional(),
    engineCapacity: z.number().positive().optional(),
    transmission: z.enum(['MANUAL', 'AUTOMATIC', 'CVT', 'SEMI_AUTOMATIC', 'UNKNOWN']).optional(),
    isPrimary: z.boolean().optional(),
    color: z.string().max(30).optional(),
    plateNumber: z.string().max(20).optional(),
  }),
});

const setPrimarySchema = z.object({});

const fuelEfficiencySchema = z.object({
  body: z.object({
    fuelType: z.enum(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID', 'ETHANOL', 'HYDROGEN']),
    averageMileage: z.number().positive('Average mileage must be positive'),
    distanceUnit: z.enum(['km', 'mile']).optional(),
    volumeUnit: z.enum(['liter', 'gallon']).optional(),
    source: z.enum(['manual', 'auto', 'estimated']).optional(),
  }),
});

export const VehicleValidation = {
  createVehicleSchema,
  updateVehicleSchema,
  setPrimarySchema,
  fuelEfficiencySchema,
};
