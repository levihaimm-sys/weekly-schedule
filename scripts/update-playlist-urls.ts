/**
 * Script to update playlist URLs for all lesson plans
 * Maps each lesson plan category to the appropriate Wix playlist
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapping of lesson name patterns to playlist URLs
const PLAYLIST_MAPPING: Record<string, string> = {
  // פתיחת שנה
  'פתיחת שנה': 'https://hspisrael.wixsite.com/newbuli/copy-of-%D7%94%D7%AA%D7%97%D7%9C%D7%AA-%D7%A9%D7%A0%D7%94',
  
  // התחלת שנה (same as פתיחת שנה or different?)
  'התחלת שנה': 'https://hspisrael.wixsite.com/newbuli/copy-of-2',
  
  // מיומנות יסוד
  'מיומנות יסוד': 'https://hspisrael.wixsite.com/newbuli/copy-of-11',
  'מיומנויות יסוד': 'https://hspisrael.wixsite.com/newbuli/copy-of-11',
  
  // שיווי משקל
  'שיווי משקל': 'https://hspisrael.wixsite.com/newbuli/copy-of-5',
  
  // משחקי כדור
  'משחקי כדור': 'https://hspisrael.wixsite.com/newbuli/copy-of-7',
  
  // גמישות ותנועה
  'גמישות': 'https://hspisrael.wixsite.com/newbuli/music', // Default - needs specific URL
  'גמישות תנועה': 'https://hspisrael.wixsite.com/newbuli/music',
  'גמישות ותנועה': 'https://hspisrael.wixsite.com/newbuli/music',
  
  // חגים
  'חגי תשרי': 'https://hspisrael.wixsite.com/newbuli/music',
  'חנוכה': 'https://hspisrael.wixsite.com/newbuli/music',
  'פורים': 'https://hspisrael.wixsite.com/newbuli/music',
  'יום העצמאות': 'https://hspisrael.wixsite.com/newbuli/music',
  'פסח': 'https://hspisrael.wixsite.com/newbuli/music',
};

async function updatePlaylistUrls() {
  console.log('🎵 Updating playlist URLs for lesson plans...\n');

  // Get all lesson plans
  const { data: lessonPlans, error } = await supabase
    .from('lesson_plans')
    .select('id, name, week_number');

  if (error || !lessonPlans) {
    console.error('❌ Error fetching lesson plans:', error);
    return;
  }

  console.log(`Found ${lessonPlans.length} lesson plans\n`);

  let updated = 0;
  let skipped = 0;

  for (const plan of lessonPlans) {
    // Find matching playlist URL
    let playlistUrl: string | null = null;

    for (const [pattern, url] of Object.entries(PLAYLIST_MAPPING)) {
      if (plan.name.includes(pattern)) {
        playlistUrl = url;
        break;
      }
    }

    if (playlistUrl) {
      const { error: updateError } = await supabase
        .from('lesson_plans')
        .update({ playlist_url: playlistUrl })
        .eq('id', plan.id);

      if (updateError) {
        console.error(`❌ Error updating ${plan.name}:`, updateError.message);
      } else {
        console.log(`✅ ${plan.name} → ${playlistUrl}`);
        updated++;
      }
    } else {
      console.log(`⚠️  No playlist found for: ${plan.name}`);
      skipped++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`\n✅ Playlist URLs update completed!`);
}

// Run the update
updatePlaylistUrls();
