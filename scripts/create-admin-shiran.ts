/**
 * One-time script to:
 * 1. Create a new admin user (שירן) with email haiminmotion@gmail.com
 * 2. Update existing admin (חיים) display_name for levihaimm@gmail.com
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please ensure .env.local has:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // ===== 1. Create Shiran's auth user =====
  console.log('Creating auth user for שירן...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'haiminmotion@gmail.com',
    password: 'Admin123@',
    email_confirm: true,
  });

  if (authError) {
    console.error('❌ Failed to create auth user:', authError.message);
    process.exit(1);
  }

  const shiranUserId = authData.user.id;
  console.log(`✅ Auth user created: ${shiranUserId}`);

  // ===== 2. Create Shiran's profile =====
  console.log('Creating profile for שירן...');
  const { error: profileError } = await supabase.from('profiles').insert({
    id: shiranUserId,
    role: 'admin',
    display_name: 'שירן',
    email: 'haiminmotion@gmail.com',
  });

  if (profileError) {
    console.error('❌ Failed to create profile:', profileError.message);
    process.exit(1);
  }
  console.log('✅ Profile created for שירן');

  // ===== 3. Update Haim's display_name =====
  console.log('Updating display_name for חיים...');
  const { data: haimProfile, error: haimLookupError } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('email', 'levihaimm@gmail.com')
    .single();

  if (haimLookupError || !haimProfile) {
    console.error('❌ Could not find profile for levihaimm@gmail.com:', haimLookupError?.message);
    console.log('Trying to find by role=admin...');

    // Fallback: find the other admin profile that isn't Shiran
    const { data: admins } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .eq('role', 'admin')
      .neq('id', shiranUserId);

    if (admins && admins.length > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: 'חיים' })
        .eq('id', admins[0].id);

      if (updateError) {
        console.error('❌ Failed to update Haim display_name:', updateError.message);
      } else {
        console.log(`✅ Updated display_name to חיים for profile ${admins[0].id}`);
      }
    } else {
      console.log('⚠️ No other admin profile found. You may need to update manually.');
    }
  } else {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: 'חיים' })
      .eq('id', haimProfile.id);

    if (updateError) {
      console.error('❌ Failed to update:', updateError.message);
    } else {
      console.log(`✅ Updated display_name to חיים for ${haimProfile.email}`);
    }
  }

  console.log('\n🎉 Done!');
  console.log('Shiran can now login at /login with:');
  console.log('  Email: haiminmotion@gmail.com');
  console.log('  Password: Admin123@');
}

main().catch(console.error);
