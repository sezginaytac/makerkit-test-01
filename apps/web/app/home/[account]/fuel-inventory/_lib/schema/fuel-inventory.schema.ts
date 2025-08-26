import { z } from 'zod';

export const PortDataSchema = z.object({
	port_name: z.string().min(1, 'Port name is required'),
	eta_date: z.string().min(1, 'ETA is required'),
});

export type PortDataForm = z.infer<typeof PortDataSchema>;

export const FuelDataSchema = z.object({
	id: z.string().uuid().optional(),
	ship_id: z.string().uuid(),
	fuel_type: z.string().min(1),
	rob: z.number().nonnegative(),
	me: z.number().positive(),
	ae: z.number().positive(),
	boiler: z.number().positive(),
	port_id: z.string().uuid().nullable().optional(),
});

export type FuelDataForm = z.infer<typeof FuelDataSchema>;


