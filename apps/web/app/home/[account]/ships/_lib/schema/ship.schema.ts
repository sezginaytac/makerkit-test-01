import { z } from 'zod';

export const ShipSchema = z.object({
  name: z.string().min(1, 'Ship name is required'),
  imo_number: z.string()
    .min(1, 'IMO number is required')
    .regex(/^\d{7}$/, 'IMO number must be exactly 7 digits'),
  vessel_type: z.string().optional(),
  capacity: z.number().min(0, 'Capacity must be 0 or greater').optional(),
  fuel_consumption_rate: z.number().min(0, 'Fuel consumption rate must be 0 or greater').optional(),
  fuel_types: z.string().min(1, 'At least one fuel type is required'),
});

export type ShipForm = z.infer<typeof ShipSchema>;
