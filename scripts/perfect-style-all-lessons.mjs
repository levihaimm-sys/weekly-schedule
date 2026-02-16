/**
 * Perfect manual-style conversion for ALL lesson plans
 * Creates beautiful, readable HTML like the manual version
 */

import { createClient } from '@supabase/supabase-js';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LESSON_FOLDERS = [
  {
    path: 'Lessons/1 - פתיחת שנה, מודעות לגוף וחגי תשרי',
    prefix: 'פתיחת שנה'
  },
  {
    path: 'Lessons/2 - מיומנוית יסוד, תנועה במרחב וחנוכה',
    prefix: 'מיומנות יסוד'
  },
  {
    path: 'Lessons/3 - שיווי משקל, יציבה נכונה וויסות כוח',
    prefix: 'שיווי משקל'
  },
  {
    path: 'Lessons/4 - משחקי כדור ומיומנוית תקשורת',
    prefix: 'משחקי כדור'
  },
  {
    path: 'Lessons/5 - גמישות והתעמלות קרקע, ריקוד ונופש פעיל',
    prefix: 'גמישות תנועה'
  }
];

/**
 * Parse PDF text and extract structured data
 */
function parseLessonPlan(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.includes('-- ') && !l.includes(' of '));
  
  const lesson = {
    title: '',
    time: '',
    equipment: '',
    stamp: '',
    goals: [],
    opening: { time: '', content: [] },
    mainBody: { time: '', content: [] },
    course: { time: '', content: [] },
    summary: { time: '', content: [] }
  };
  
  let currentSection = null;
  let currentSubsection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Title
    if (i === 0 && line.includes('מערך')) {
      lesson.title = line;
      continue;
    }
    
    // Time
    if (line.includes('זמן מערך')) {
      lesson.time = line.replace('זמן מערך', '').replace(/[-:]/g, '').trim();
      continue;
    }
    
    // Equipment
    if (line.includes('ציוד')) {
      lesson.equipment = line.replace('ציוד:', '').replace('ציוד', '').trim();
      continue;
    }
    
    // Stamp
    if (line.includes('חותמת')) {
      lesson.stamp = line.replace('חותמת', '').replace('-', '').trim();
      continue;
    }
    
    // Sections
    if (line.includes('מטרה המפגש')) {
      currentSection = 'goals';
      continue;
    }
    
    if (line.includes('פתיחה:')) {
      currentSection = 'opening';
      const timeMatch = line.match(/(\d+)\s*דק'/);
      if (timeMatch) lesson.opening.time = timeMatch[1];
      continue;
    }
    
    if (line.includes('גוף השיעור')) {
      currentSection = 'mainBody';
      const timeMatch = line.match(/(\d+)\s*דק'/);
      if (timeMatch) lesson.mainBody.time = timeMatch[1];
      continue;
    }
    
    if (line.includes('מסלול:')) {
      currentSection = 'course';
      const timeMatch = line.match(/(\d+)\s*דק'/);
      if (timeMatch) lesson.course.time = timeMatch[1];
      continue;
    }
    
    if (line.includes('סיכום:')) {
      currentSection = 'summary';
      const timeMatch = line.match(/(\d+)\s*דק'/);
      if (timeMatch) lesson.summary.time = timeMatch[1];
      continue;
    }
    
    // Content
    if (currentSection) {
      if (currentSection === 'goals') {
        lesson.goals.push(line);
      } else {
        if (/^\d+\s*\./.test(line)) {
          currentSubsection = { title: line, content: [] };
          lesson[currentSection].content.push(currentSubsection);
        } else if (currentSubsection) {
          currentSubsection.content.push(line);
        } else {
          lesson[currentSection].content.push(line);
        }
      }
    }
  }
  
  return lesson;
}

/**
 * Create beautiful HTML from parsed lesson data
 */
function createBeautifulHTML(lesson) {
  let html = '<div class="max-w-4xl mx-auto space-y-6">\n';
  
  // Main title
  html += `
  <div class="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-8">
    <h1 class="text-3xl font-bold">${lesson.title}</h1>
  </div>\n`;
  
  // Info cards
  html += `
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⏱️</span>
        <h3 class="font-bold text-blue-900">זמן מערך</h3>
      </div>
      <p class="text-gray-700">${lesson.time || '45-30 דקות'}</p>
    </div>
    <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">📦</span>
        <h3 class="font-bold text-purple-900">ציוד</h3>
      </div>
      <p class="text-gray-700 text-sm">${lesson.equipment || 'לא צוין'}</p>
    </div>
    <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-2xl">⭐</span>
        <h3 class="font-bold text-green-900">חותמת</h3>
      </div>
      <p class="text-gray-700">${lesson.stamp || 'לא צוינה'}</p>
    </div>
  </div>\n`;
  
  // Goals
  if (lesson.goals.length > 0) {
    html += `
  <div class="bg-white border-2 border-blue-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-blue-100 px-6 py-4 border-b-2 border-blue-200">
      <h2 class="text-2xl font-bold text-blue-900 flex items-center gap-2">
        <span>🎯</span>
        מטרת המפגש
      </h2>
    </div>
    <div class="p-6">
      <ul class="space-y-2">\n`;
    
    lesson.goals.forEach(goal => {
      html += `        <li class="flex items-start gap-2">
          <span class="text-blue-500 mt-1">•</span>
          <span class="text-gray-700">${goal}</span>
        </li>\n`;
    });
    
    html += `      </ul>
    </div>
  </div>\n`;
  }
  
  // Opening
  if (lesson.opening.content.length > 0) {
    html += `
  <div class="bg-white border-2 border-green-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-green-100 px-6 py-4 border-b-2 border-green-200">
      <h2 class="text-2xl font-bold text-green-900 flex items-center gap-2">
        <span>🚀</span>
        פתיחה${lesson.opening.time ? ': ' + lesson.opening.time + " דק'" : ''}
      </h2>
    </div>
    <div class="p-6 space-y-4">\n`;
    
    lesson.opening.content.forEach(item => {
      if (typeof item === 'string') {
        html += `      <p class="text-gray-700">${item}</p>\n`;
      } else {
        html += `      <div>
        <h3 class="font-bold text-gray-800 mb-2">${item.title}</h3>\n`;
        item.content.forEach(line => {
          html += `        <p class="text-gray-700 mb-2">${line}</p>\n`;
        });
        html += `      </div>\n`;
      }
    });
    
    html += `    </div>
  </div>\n`;
  }
  
  // Main body
  if (lesson.mainBody.content.length > 0) {
    html += `
  <div class="bg-white border-2 border-purple-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-purple-100 px-6 py-4 border-b-2 border-purple-200">
      <h2 class="text-2xl font-bold text-purple-900 flex items-center gap-2">
        <span>💪</span>
        גוף השיעור${lesson.mainBody.time ? ': ' + lesson.mainBody.time + " דק'" : ''}
      </h2>
    </div>
    <div class="p-6 space-y-4">\n`;
    
    lesson.mainBody.content.forEach(item => {
      if (typeof item === 'string') {
        if (item.startsWith('●') || item.startsWith('-')) {
          html += `      <p class="text-gray-700 flex items-start gap-2">
        <span class="text-purple-500">•</span>
        <span>${item.substring(1).trim()}</span>
      </p>\n`;
        } else {
          html += `      <p class="text-gray-700">${item}</p>\n`;
        }
      } else {
        html += `      <div>
        <h3 class="font-bold text-gray-800 mb-2">${item.title}</h3>\n`;
        item.content.forEach(line => {
          if (line.startsWith('●') || line.startsWith('-')) {
            html += `        <p class="text-gray-700 flex items-start gap-2 mb-1">
          <span class="text-purple-500">•</span>
          <span>${line.substring(1).trim()}</span>
        </p>\n`;
          } else {
            html += `        <p class="text-gray-700 mb-2">${line}</p>\n`;
          }
        });
        html += `      </div>\n`;
      }
    });
    
    html += `    </div>
  </div>\n`;
  }
  
  // Course
  if (lesson.course.content.length > 0) {
    html += `
  <div class="bg-white border-2 border-orange-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-orange-100 px-6 py-4 border-b-2 border-orange-200">
      <h2 class="text-2xl font-bold text-orange-900 flex items-center gap-2">
        <span>🏃</span>
        מסלול${lesson.course.time ? ': ' + lesson.course.time + " דק'" : ''}
      </h2>
    </div>
    <div class="p-6 space-y-4">\n`;
    
    lesson.course.content.forEach(item => {
      if (typeof item === 'string') {
        html += `      <p class="text-gray-700">${item}</p>\n`;
      } else {
        html += `      <div class="bg-orange-50 rounded-lg p-4">
        <h3 class="font-bold text-orange-900 mb-2">${item.title}</h3>\n`;
        item.content.forEach(line => {
          html += `        <p class="text-gray-700">${line}</p>\n`;
        });
        html += `      </div>\n`;
      }
    });
    
    html += `    </div>
  </div>\n`;
  }
  
  // Summary
  if (lesson.summary.content.length > 0) {
    html += `
  <div class="bg-white border-2 border-pink-200 rounded-xl shadow-md overflow-hidden">
    <div class="bg-pink-100 px-6 py-4 border-b-2 border-pink-200">
      <h2 class="text-2xl font-bold text-pink-900 flex items-center gap-2">
        <span>✨</span>
        סיכום${lesson.summary.time ? ': ' + lesson.summary.time + " דק'" : ''}
      </h2>
    </div>
    <div class="p-6 space-y-4">\n`;
    
    lesson.summary.content.forEach(item => {
      if (typeof item === 'string') {
        if (item.startsWith('●') || item.startsWith('-')) {
          html += `      <p class="text-gray-700 flex items-start gap-2">
        <span class="text-pink-500">•</span>
        <span>${item.substring(1).trim()}</span>
      </p>\n`;
        } else {
          html += `      <p class="text-gray-700">${item}</p>\n`;
        }
      }
    });
    
    html += `    </div>
  </div>\n`;
  }
  
  // Stamp card
  html += `
  <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-xl shadow-lg p-6 text-center">
    <h3 class="text-xl font-bold text-yellow-900 mb-2 flex items-center justify-center gap-2">
      <span>🎖️</span>
      חלוקת חותמת: ${lesson.stamp}
    </h3>
  </div>\n`;
  
  // Success
  html += `
  <div class="text-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-md py-4">
    <p class="text-xl font-bold">בהצלחה! 🎉</p>
  </div>\n`;
  
  html += '</div>';
  
  return html;
}

/**
 * Extract text from PDF
 */
async function extractTextFromPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = new Uint8Array(dataBuffer);
  
  const loadingTask = getDocument({
    data,
    verbosity: 0,
    isEvalSupported: false,
    useSystemFonts: true
  });
  
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  
  let text = '';
  
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    text += pageText + '\n';
  }
  
  return text;
}

function extractLessonNumber(filename) {
  const match = filename.match(/מערך\s*(\d+)/);
  return match ? match[1] : null;
}

/**
 * Process all lessons
 */
async function processAllLessons() {
  console.log('🎨 Starting perfect styling for all lessons...\n');
  
  const { data: lessonPlans } = await supabase
    .from('lesson_plans')
    .select('id, name, week_number')
    .order('week_number');
  
  console.log(`Found ${lessonPlans.length} lesson plans in DB\n`);
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const folder of LESSON_FOLDERS) {
    console.log(`\n📁 Processing: ${folder.prefix}`);
    
    const folderPath = path.join(process.cwd(), folder.path);
    if (!fs.existsSync(folderPath)) continue;
    
    const files = fs.readdirSync(folderPath);
    const pdfFiles = files.filter(f => f.endsWith('.pdf'));
    
    console.log(`   Found ${pdfFiles.length} PDFs`);
    
    for (const pdfFile of pdfFiles) {
      const lessonNumber = extractLessonNumber(pdfFile);
      if (!lessonNumber) {
        skipped++;
        continue;
      }
      
      const lessonName = `${folder.prefix} ${lessonNumber}`;
      const lessonPlan = lessonPlans.find(lp => lp.name === lessonName);
      
      if (!lessonPlan) {
        console.log(`   ⚠️  No match: ${lessonName}`);
        skipped++;
        continue;
      }
      
      try {
        const pdfPath = path.join(folderPath, pdfFile);
        const text = await extractTextFromPDF(pdfPath);
        const parsed = parseLessonPlan(text);
        const html = createBeautifulHTML(parsed);
        
        const { error } = await supabase
          .from('lesson_plans')
          .update({ content: html })
          .eq('id', lessonPlan.id);
        
        if (error) {
          console.log(`   ❌ ${lessonName}: ${error.message}`);
          errors++;
        } else {
          console.log(`   ✅ ${lessonName}`);
          updated++;
        }
      } catch (err) {
        console.log(`   ❌ ${lessonName}: ${err.message}`);
        errors++;
      }
    }
  }
  
  console.log(`\n\n📊 Summary:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`\n✨ Perfect styling complete!`);
}

processAllLessons()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
