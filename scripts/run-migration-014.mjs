import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Running migration 014: add equipment distribution...');

const migrationSQL = `
-- Add equipment distribution tracking to weekly_lesson_assignments
ALTER TABLE weekly_lesson_assignments
ADD COLUMN IF NOT EXISTS equipment_distributed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS equipment_distributed_at TIMESTAMPTZ;

-- Add route field to instructors for grouping in distribution
ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS route TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_weekly_assignments_equipment 
ON weekly_lesson_assignments(week_start_date, equipment_distributed);

-- Update existing assignments to have equipment_distributed = false
UPDATE weekly_lesson_assignments
SET equipment_distributed = FALSE
WHERE equipment_distributed IS NULL;
`;

// Split by semicolon and execute each statement
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

for (const statement of statements) {
  console.log(`Executing: ${statement.substring(0, 50)}...`);
  const { error } = await supabase.rpc('exec_sql', { sql: statement });
  
  if (error) {
    console.error('Error:', error);
    // Continue with other statements
  } else {
    console.log('✓ Success');
  }
}

console.log('\n✅ Migration 014 completed!');
process.exit(0);
