-- Add port_id column to fuel_inventory table
-- This column links fuel inventory data to specific ports

ALTER TABLE public.fuel_inventory 
ADD COLUMN IF NOT EXISTS port_id UUID REFERENCES public.ports(id) ON DELETE SET NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.fuel_inventory.port_id IS 'Reference to the port where this fuel data was recorded';

-- Create an index on port_id for better query performance
CREATE INDEX IF NOT EXISTS idx_fuel_inventory_port_id ON public.fuel_inventory(port_id);

