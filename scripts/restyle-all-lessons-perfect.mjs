/**
 * Create PERFECT styling for all lesson plans
 * Beautiful cards, icons, sections with proper spacing
 * 
 * Run with: node scripts/restyle-all-lessons-perfect.mjs
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
 * Parse PDF text and create beautiful HTML
 */
function createBeautifulHTML(text) {
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.includes('-- ') && !l.includes(' of '));

  let html = '<div class="max-w-4xl mx-auto space-y-6">\n';
  
  let currentSection = null;
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Main title
    if (i === 0 && line.includes('מערך')) {
      html += `
  <!-- Main Title -->
  <div class="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl p-8 text-center">
    <h1 class="text-4xl font-bold mb-2">${line}</h1>
  </div>\n`;
      continue;
    }
    
    // Meta info (זמן, ציוד, חותמת)
    if (line.includes('זמן מערך') || line.includes('ציוד') || line.includes('חותמת')) {
      if (inList) {
        html += '      </ul>\n    </div>\n  </div>\n';
        inList = false;
        currentSection = null;
      }
      
      let icon = '⏱️';
      let color = 'blue';
      if (line.includes('ציוד')) {
        icon = '📦';
        color = 'purple';
      } else if (line.includes('חותמת')) {
        icon = '⭐';
        color = 'yellow';
      }
      
      html += `
  <!-- Meta Info -->
  <div class="bg-gradient-to-r from-${color}-50 to-${color}-100 border-r-4 border-${color}-500 rounded-lg shadow-md p-4 flex items-start gap-3">
    <span class="text-3xl">${icon}</span>
    <p class="text-gray-800 leading-relaxed flex-1"><strong>${line}</strong></p>
  </div>\n`;
      continue;
    }
    
    // Section headers (מטרה, פתיחה, גוף השיעור, מסלול, סיכום)
    if (
      line.includes('מטרה המפגש') ||
      line.includes('פתיחה:') ||
      line.includes('גוף השיעור') ||
      line.includes('מסלול:') ||
      line.includes('סיכום:') ||
      line.includes('חלוקת חותמת')
    ) {
      if (inList) {
        html += '      </ul>\n    </div>\n  </div>\n';
        inList = false;
      }
      if (currentSection) {
        html += '    </div>\n  </div>\n';
      }
      
      let icon = '🎯';
      let bgColor = 'bg-gradient-to-br from-blue-50 to-blue-100';
      let borderColor = 'border-blue-300';
      
      if (line.includes('פתיחה')) {
        icon = '🚀';
        bgColor = 'bg-gradient-to-br from-green-50 to-green-100';
        borderColor = 'border-green-300';
      } else if (line.includes('גוף השיעור')) {
        icon = '💪';
        bgColor = 'bg-gradient-to-br from-purple-50 to-purple-100';
        borderColor = 'border-purple-300';
      } else if (line.includes('מסלול')) {
        icon = '🏃';
        bgColor = 'bg-gradient-to-br from-orange-50 to-orange-100';
        borderColor = 'border-orange-300';
      } else if (line.includes('סיכום')) {
        icon = '✨';
        bgColor = 'bg-gradient-to-br from-pink-50 to-pink-100';
        borderColor = 'border-pink-300';
      } else if (line.includes('חלוקת חותמת')) {
        icon = '🎖️';
        bgColor = 'bg-gradient-to-br from-yellow-50 to-yellow-100';
        borderColor = 'border-yellow-300';
      }
      
      html += `
  <!-- Section: ${line} -->
  <div class="${bgColor} border-2 ${borderColor} rounded-xl shadow-lg overflow-hidden">
    <div class="bg-white bg-opacity-70 px-6 py-4 border-b-2 ${borderColor} flex items-center gap-3">
      <span class="text-3xl">${icon}</span>
      <h2 class="text-2xl font-bold text-gray-800">${line}</h2>
    </div>
    <div class="p-6 space-y-4">\n`;
      
      currentSection = line;
      continue;
    }
    
    // Subsections (numbered)
    if (/^\d+\s*\./.test(line)) {
      if (inList) {
        html += '      </ul>\n';
        inList = false;
      }
      html += `      <h3 class="text-lg font-semibold text-purple-700 mt-4 mb-2 flex items-center gap-2">
        <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">${line.match(/^\d+/)[0]}</span>
        ${line}
      </h3>\n`;
      continue;
    }
    
    // Bullet points
    if (line.startsWith('●') || line.startsWith('-')) {
      const content = line.substring(1).trim();
      if (!inList) {
        html += '      <ul class="space-y-2 mr-8">\n';
        inList = true;
      }
      html += `        <li class="flex items-start gap-3">
          <span class="text-purple-500 text-xl mt-0.5">•</span>
          <span class="text-gray-700 leading-relaxed flex-1">${content}</span>
        </li>\n`;
      continue;
    }
    
    // Regular paragraph
    if (inList && !line.startsWith('●') && !line.startsWith('-')) {
      html += '      </ul>\n';
      inList = false;
    }
    
    if (line.length > 0) {
      html += `      <p class="text-gray-700 leading-relaxed">${line}</p>\n`;
    }
  }
  
  // Close any open sections
  if (inList) {
    html += '      </ul>\n';
  }
  if (currentSection) {
    html += '    </div>\n  </div>\n';
  }
  
  html += '</div>';
  
  return html;
}

/**
 * Update all lesson plans with perfect styling
 */
async function restyleAllLessons() {
  console.log('🎨 Creating PERFECT styling for all lesson plans...\n');

  // Get all lesson plans
  const { data: lessonPlans, error } = await supabase
    .from('lesson_plans')
    .select('id, name, content')
    .order('week_number');

  if (error || !lessonPlans) {
    console.error('❌ Error fetching lesson plans:', error);
    return;
  }

  console.log(`Found ${lessonPlans.length} lesson plans\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const lessonPlan of lessonPlans) {
    if (!lessonPlan.content) {
      console.log(`   ⏭️  No content: ${lessonPlan.name}`);
      skipped++;
      continue;
    }

    try {
      // Remove all existing HTML tags to get plain text
      const plainText = lessonPlan.content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Create beautiful HTML
      const beautifulHTML = createBeautifulHTML(plainText);

      // Update database
      const { error: updateError } = await supabase
        .from('lesson_plans')
        .update({ content: beautifulHTML })
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
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`\n✨ Perfect styling complete!`);
  console.log(`\n🎨 All lessons now have beautiful cards, icons, and sections!`);
}

// Run the styling
restyleAllLessons()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
