-- Fix fuel_quality_data table columns
-- Add missing aluminium and silicon columns
ALTER TABLE public.fuel_quality_data 
ADD COLUMN IF NOT EXISTS aluminium DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS silicon DECIMAL(10,4);

-- Update existing aluminium_silicon column to match schema
ALTER TABLE public.fuel_quality_data 
ALTER COLUMN aluminium_silicon TYPE DECIMAL(10,4);

-- Add other missing columns from schema
ALTER TABLE public.fuel_quality_data 
ADD COLUMN IF NOT EXISTS flash_point DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS mcr DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS total_sediment DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS calcium DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS phosphorus DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS zinc DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS iron DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS nickel DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS lead DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS potassium DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS net_specific_energy DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS gross_specific_energy DECIMAL(10,4);

-- Update existing columns to match schema (using correct column names)
ALTER TABLE public.fuel_quality_data 
ALTER COLUMN density_fifteen_c TYPE DECIMAL(10,4),
ALTER COLUMN k_viscosity_fifty_c TYPE DECIMAL(10,4),
ALTER COLUMN pour_point TYPE DECIMAL(10,4),
ALTER COLUMN ash TYPE DECIMAL(10,4),
ALTER COLUMN water_content TYPE DECIMAL(10,4),
ALTER COLUMN sulphur_content TYPE DECIMAL(10,4),
ALTER COLUMN vanadium TYPE DECIMAL(10,4),
ALTER COLUMN sodium TYPE DECIMAL(10,4),
ALTER COLUMN ccai TYPE DECIMAL(10,4);

-- Rename columns to match schema
ALTER TABLE public.fuel_quality_data 
RENAME COLUMN density_fifteen_c TO density_15c;

ALTER TABLE public.fuel_quality_data 
RENAME COLUMN k_viscosity_fifty_c TO k_viscosity_50c;
