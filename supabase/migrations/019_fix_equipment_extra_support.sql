-- Fix: Allow expected_quantity = 0 for extra equipment and add is_extra column

-- Drop the existing check constraint that requires expected_quantity > 0
ALTER TABLE equipment_confirmations
  DROP CONSTRAINT IF EXISTS equipment_confirmations_expected_quantity_check;

-- Add new constraint allowing 0 (for extra equipment not in original list)
ALTER TABLE equipment_confirmations
  ADD CONSTRAINT equipment_confirmations_expected_quantity_check
  CHECK (expected_quantity >= 0);

-- Add is_extra column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipment_confirmations' AND column_name = 'is_extra'
  ) THEN
    ALTER TABLE equipment_confirmations ADD COLUMN is_extra BOOLEAN DEFAULT false;
  END IF;
END $$;
