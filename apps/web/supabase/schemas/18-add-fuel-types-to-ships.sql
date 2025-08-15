/*
 * -------------------------------------------------------
 * Section: Add fuel_types column to ships table
 * -------------------------------------------------------
 */

-- Add fuel_types column to ships table
ALTER TABLE public.ships 
ADD COLUMN IF NOT EXISTS fuel_types TEXT NOT NULL DEFAULT 'HFO,VLSFO,MGO';

-- Add comment to explain the column
COMMENT ON COLUMN public.ships.fuel_types IS 'Comma-separated list of fuel types available for this ship';

-- Create a check constraint to ensure valid fuel types (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ships_fuel_types_check'
  ) THEN
    ALTER TABLE public.ships 
    ADD CONSTRAINT ships_fuel_types_check 
    CHECK (
      fuel_types ~ '^(HFO|VLSFO|MGO)(,(HFO|VLSFO|MGO))*$'
    );
  END IF;
END $$;
