/**
 * One-time script to create a new admin login for רוית דביר.
 * She keeps her existing instructor (phone-login) account untouched.
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

const EMAIL = 'Ravitdvir25@gmail.com';
const PASSWORD = 'Admin123@';
const DISPLAY_NAME = 'רוית דביר';

async function main() {
  console.log('Creating auth user for רוית...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });

  if (authError) {
    console.error('❌ Failed to create auth user:', authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log(`✅ Auth user created: ${userId}`);

  console.log('Creating admin profile for רוית...');
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    role: 'admin',
    display_name: DISPLAY_NAME,
    email: EMAIL,
  });

  if (profileError) {
    console.error('❌ Failed to create profile:', profileError.message);
    process.exit(1);
  }

  console.log('✅ Profile created for רוית');
  console.log('\n🎉 Done!');
  console.log('רוית can now login at /login with:');
  console.log(`  Email: ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
}

main().catch(console.error);
