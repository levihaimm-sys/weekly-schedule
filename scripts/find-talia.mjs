import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Finding Talia...\n');

// Search for Talia by name
const { data: instructors, error } = await supabase
  .from('instructors')
  .select('id, full_name, phone')
  .ilike('full_name', '%טליה%');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

if (!instructors || instructors.length === 0) {
  console.log('No instructor found with name containing "טליה"');
  
  // Show all instructors
  const { data: all } = await supabase
    .from('instructors')
    .select('id, full_name, phone')
    .order('full_name');
  
  console.log('\nAll instructors:');
  all?.forEach(i => console.log(`  - ${i.full_name} (${i.phone})`));
} else {
  console.log('Found:');
  instructors.forEach(i => {
    console.log(`  - ${i.full_name}`);
    console.log(`    Phone: ${i.phone}`);
    console.log(`    ID: ${i.id}`);
  });
}

process.exit(0);
