import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Checking Talia\'s profile and authentication...\n');

// Find Talia's profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('display_name', 'טליה דודזון')
  .single();

if (!profile) {
  console.log('❌ Profile not found');
  
  // Try to find by instructor_id
  const { data: profile2 } = await supabase
    .from('profiles')
    .select('*')
    .eq('instructor_id', 'c4d09187-8bb5-4cdb-912f-ce7e7f7c8482')
    .single();
  
  if (profile2) {
    console.log('✅ Found profile by instructor_id:');
    console.log('   User ID:', profile2.id);
    console.log('   Display Name:', profile2.display_name);
    console.log('   Instructor ID:', profile2.instructor_id);
    console.log('   Role:', profile2.role);
  }
  process.exit(0);
}

console.log('✅ Profile found:');
console.log('   User ID:', profile.id);
console.log('   Display Name:', profile.display_name);
console.log('   Instructor ID:', profile.instructor_id);
console.log('   Role:', profile.role);
console.log('   Created:', profile.created_at);

// Check if instructor_id matches
const { data: instructor } = await supabase
  .from('instructors')
  .select('*')
  .eq('id', profile.instructor_id)
  .single();

console.log('\n👤 Instructor record:');
if (instructor) {
  console.log('   ✅ Found:', instructor.full_name);
  console.log('   ID:', instructor.id);
} else {
  console.log('   ❌ Not found - MISMATCH!');
}

// Check auth user
const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);

console.log('\n🔐 Auth user:');
if (authUser?.user) {
  console.log('   ✅ Found');
  console.log('   Email:', authUser.user.email);
  console.log('   Created:', authUser.user.created_at);
  console.log('   Last sign in:', authUser.user.last_sign_in_at);
} else {
  console.log('   ❌ Not found');
  console.log('   Error:', authError);
}

// Test the RLS policy by checking if the query would work
console.log('\n🔒 Testing RLS...');
console.log('   Profile instructor_id:', profile.instructor_id);
console.log('   Expected to match:', 'c4d09187-8bb5-4cdb-912f-ce7e7f7c8482');
console.log('   Match:', profile.instructor_id === 'c4d09187-8bb5-4cdb-912f-ce7e7f7c8482' ? '✅' : '❌');

process.exit(0);
