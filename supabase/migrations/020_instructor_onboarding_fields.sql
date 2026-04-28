-- Add onboarding fields to instructors table
ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS employment_type TEXT
    CHECK (employment_type IN ('permanent', 'temporary')),
  ADD COLUMN IF NOT EXISTS clients TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS id_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS contract_url TEXT,
  ADD COLUMN IF NOT EXISTS monthly_report_link TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_added BOOLEAN DEFAULT false;
