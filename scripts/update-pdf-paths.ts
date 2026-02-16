/**
 * Script to update PDF paths in lesson_plans table
 * Maps Hebrew categories to English file names in Supabase Storage
 *
 * Run with: npx tsx scripts/update-pdf-paths.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Map Hebrew category names to English prefixes
 */
const categoryMap: Record<string, string> = {
  'פתיחת שנה, מודעות לגוף וחגי תשרי': 'opening',
  'מיומנות יסוד, תנועה במרחב וחנוכה': 'basic',
  'שיווי משקל, יציבה נכונה וויסות כוח': 'balance',
  'משחקי כדור ומיומנות תקשורת': 'ball',
  'גמישות והתעמלות קרקע, ריקוד ונופש פעיל': 'flex',
};

/**
 * Main function to update PDF paths
 */
async function updatePdfPaths() {
  console.log('🔍 Fetching all lesson plans...');

  // Fetch all lesson plans ordered by category and week_number (numeric order)
  const { data: lessonPlans, error } = await supabase
    .from('lesson_plans')
    .select('id, name, category, week_number, pdf_path')
    .order('category')
    .order('week_number');

  if (error) {
    console.error('❌ Error fetching lesson plans:', error);
    process.exit(1);
  }

  if (!lessonPlans || lessonPlans.length === 0) {
    console.log('⚠️  No lesson plans found');
    return;
  }

  console.log(`✅ Found ${lessonPlans.length} lesson plans\n`);

  // Group by category and assign sequential numbers (sorted by week_number, not name)
  const categoryCounters: Record<string, number> = {};
  const updates: Array<{ id: string; pdf_path: string; name: string }> = [];

  for (const plan of lessonPlans) {
    // Get English prefix for category
    const prefix = categoryMap[plan.category];

    if (!prefix) {
      console.log(`⚠️  Unknown category: ${plan.category} for lesson: ${plan.name}`);
      continue;
    }

    // Initialize counter for this category if needed
    if (!categoryCounters[prefix]) {
      categoryCounters[prefix] = 1;
    }

    // Generate PDF path using sequential counter within category
    const lessonNumber = categoryCounters[prefix];
    const pdfPath = `${prefix}-lesson-${lessonNumber}.pdf`;

    // Increment counter for next lesson in this category
    categoryCounters[prefix]++;

    updates.push({
      id: plan.id,
      pdf_path: pdfPath,
      name: plan.name,
    });

    console.log(`📝 ${plan.name}`);
    console.log(`   Category: ${plan.category} → ${prefix}`);
    console.log(`   PDF: ${pdfPath}`);
    console.log(`   Current: ${plan.pdf_path || 'null'} → New: ${pdfPath}\n`);
  }

  // Ask for confirmation
  console.log(`\n📊 Summary:`);
  console.log(`   Total lessons to update: ${updates.length}`);

  console.log('\n🔄 Updating database...');

  // Update each lesson plan
  let successCount = 0;
  let errorCount = 0;

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('lesson_plans')
      .update({ pdf_path: update.pdf_path })
      .eq('id', update.id);

    if (updateError) {
      console.error(`❌ Error updating ${update.name}:`, updateError);
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log(`\n✨ Done!`);
  console.log(`   ✅ Successfully updated: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`);
  }
}

// Run the update
updatePdfPaths().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
