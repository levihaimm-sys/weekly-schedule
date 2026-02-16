/**
 * Add beautiful Tailwind styling to all lesson plan contents
 * Updates the basic HTML with professional styling classes
 * 
 * Run with: node scripts/style-all-lesson-contents.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Add Tailwind classes to HTML content
 */
function addStylesToHTML(html) {
  if (!html) return html;
  
  let styled = html;
  
  // Main container - add padding and max width
  styled = styled.replace(
    /<div class="lesson-content">/g,
    '<div class="lesson-content max-w-4xl mx-auto">'
  );
  
  // H1 - Main title (big, bold, gradient)
  styled = styled.replace(
    /<h1>/g,
    '<h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8 text-center">'
  );
  
  // Meta info paragraphs (זמן, ציוד, חותמת) - special styling
  styled = styled.replace(
    /<p class="meta">/g,
    '<p class="bg-gradient-to-r from-blue-50 to-purple-50 border-r-4 border-blue-500 px-6 py-3 rounded-lg mb-3">'
  );
  
  // H2 - Section headers (מטרה, פתיחה, גוף השיעור, etc.)
  styled = styled.replace(
    /<h2>/g,
    '<h2 class="text-2xl font-bold text-blue-700 mt-8 mb-4 pb-2 border-b-2 border-blue-200">'
  );
  
  // H3 - Subsections (numbered items)
  styled = styled.replace(
    /<h3>/g,
    '<h3 class="text-xl font-semibold text-purple-600 mt-6 mb-3">'
  );
  
  // Regular paragraphs
  styled = styled.replace(
    /<p>(?!.*class)/g,
    '<p class="text-gray-700 leading-relaxed mb-4">'
  );
  
  // Unordered lists
  styled = styled.replace(
    /<ul>/g,
    '<ul class="space-y-2 mr-6 mb-4">'
  );
  
  // List items
  styled = styled.replace(
    /<li>/g,
    '<li class="text-gray-700 leading-relaxed flex gap-2"><span class="text-purple-500 font-bold">•</span><span class="flex-1">'
  );
  styled = styled.replace(
    /<\/li>/g,
    '</span></li>'
  );
  
  // Strong (bold text)
  styled = styled.replace(
    /<strong>/g,
    '<strong class="font-bold text-blue-700">'
  );
  
  return styled;
}

/**
 * Update all lesson plans with styled content
 */
async function styleAllLessonContents() {
  console.log('🎨 Starting to add beautiful styling to all lesson plans...\n');

  // Get all lesson plans with content
  const { data: lessonPlans, error } = await supabase
    .from('lesson_plans')
    .select('id, name, content')
    .not('content', 'is', null)
    .order('week_number');

  if (error) {
    console.error('❌ Error fetching lesson plans:', error);
    return;
  }

  if (!lessonPlans || lessonPlans.length === 0) {
    console.log('⚠️  No lesson plans with content found');
    return;
  }

  console.log(`Found ${lessonPlans.length} lesson plans to style\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const lessonPlan of lessonPlans) {
    try {
      // Check if already styled (has Tailwind classes)
      if (lessonPlan.content.includes('class="text-')) {
        console.log(`   ⏭️  Already styled: ${lessonPlan.name}`);
        skipped++;
        continue;
      }

      // Add styling
      const styledContent = addStylesToHTML(lessonPlan.content);

      // Update database
      const { error: updateError } = await supabase
        .from('lesson_plans')
        .update({ content: styledContent })
        .eq('id', lessonPlan.id);

      if (updateError) {
        console.error(`   ❌ Error updating ${lessonPlan.name}:`, updateError);
        errors++;
      } else {
        console.log(`   ✅ Styled: ${lessonPlan.name}`);
        updated++;
      }
    } catch (err) {
      console.error(`   ❌ Error processing ${lessonPlan.name}:`, err.message);
      errors++;
    }
  }

  console.log(`\n\n📊 Final Summary:`);
  console.log(`   ✅ Successfully styled: ${updated}`);
  console.log(`   ⏭️  Already styled (skipped): ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`\n✨ Styling complete!`);
  console.log(`\n🎨 All lesson plans now have beautiful Tailwind styling!`);
}

// Run the styling
styleAllLessonContents()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
