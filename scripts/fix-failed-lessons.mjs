/**
 * Fix the 3 lessons that failed
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FAILED_LESSONS = [
  'שיווי משקל 2',
  'משחקי כדור 6',
  'גמישות תנועה 4'
];

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
    
    // Meta info
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
  <div class="bg-gradient-to-r from-${color}-50 to-${color}-100 border-r-4 border-${color}-500 rounded-lg shadow-md p-4 flex items-start gap-3">
    <span class="text-3xl">${icon}</span>
    <p class="text-gray-800 leading-relaxed flex-1"><strong>${line}</strong></p>
  </div>\n`;
      continue;
    }
    
    // Section headers
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
  <div class="${bgColor} border-2 ${borderColor} rounded-xl shadow-lg overflow-hidden">
    <div class="bg-white bg-opacity-70 px-6 py-4 border-b-2 ${borderColor} flex items-center gap-3">
      <span class="text-3xl">${icon}</span>
      <h2 class="text-2xl font-bold text-gray-800">${line}</h2>
    </div>
    <div class="p-6 space-y-4">\n`;
      
      currentSection = line;
      continue;
    }
    
    // Subsections
    if (/^\d+\s*\./.test(line)) {
      if (inList) {
        html += '      </ul>\n';
        inList = false;
      }
      const num = line.match(/^\d+/)[0];
      html += `      <h3 class="text-lg font-semibold text-purple-700 mt-4 mb-2 flex items-center gap-2">
        <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">${num}</span>
        ${line}
      </h3>\n`;
      continue;
    }
    
    // Bullets
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
    
    if (inList && !line.startsWith('●') && !line.startsWith('-')) {
      html += '      </ul>\n';
      inList = false;
    }
    
    if (line.length > 0) {
      html += `      <p class="text-gray-700 leading-relaxed">${line}</p>\n`;
    }
  }
  
  if (inList) html += '      </ul>\n';
  if (currentSection) html += '    </div>\n  </div>\n';
  
  html += '</div>';
  return html;
}

async function fixFailedLessons() {
  console.log('🔧 Fixing 3 failed lessons...\n');
  
  for (const lessonName of FAILED_LESSONS) {
    const { data: lesson } = await supabase
      .from('lesson_plans')
      .select('id, content')
      .eq('name', lessonName)
      .single();
    
    if (!lesson || !lesson.content) {
      console.log(`   ⚠️  ${lessonName} - no content`);
      continue;
    }
    
    const plainText = lesson.content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const beautifulHTML = createBeautifulHTML(plainText);
    
    const { error } = await supabase
      .from('lesson_plans')
      .update({ content: beautifulHTML })
      .eq('id', lesson.id);
    
    if (error) {
      console.log(`   ❌ ${lessonName} - ${error.message}`);
    } else {
      console.log(`   ✅ ${lessonName}`);
    }
  }
  
  console.log('\n✨ Done!');
}

fixFailedLessons()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
