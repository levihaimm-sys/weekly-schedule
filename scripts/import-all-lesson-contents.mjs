/**
 * Import all lesson plan contents from PDF files using pdfjs-dist
 * Converts PDFs to basic HTML and updates the database
 * 
 * Run with: node scripts/import-all-lesson-contents.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define lesson folder mappings
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
 * Convert PDF text to basic HTML structure
 */
function convertToBasicHTML(text) {
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.includes('-- ') && !l.includes(' of ')); // Remove empty lines and page markers

  let html = '<div class="lesson-content">\n';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Main title (contains "מערך" at the start)
    if (i === 0 && line.includes('מערך')) {
      html += `<h1>${line}</h1>\n`;
      continue;
    }

    // Meta info (זמן, ציוד, חותמת)
    if (line.includes('זמן מערך') || line.includes('ציוד') || line.includes('חותמת')) {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += `<p class="meta"><strong>${line}</strong></p>\n`;
      continue;
    }

    // Main section headers (מטרה, פתיחה, גוף השיעור, מסלול, סיכום)
    if (
      line.includes('מטרה המפגש') ||
      line.includes('פתיחה:') ||
      line.includes('גוף השיעור') ||
      line.includes('מסלול:') ||
      line.includes('סיכום:') ||
      line.includes('חלוקת חותמת')
    ) {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += `<h2>${line}</h2>\n`;
      continue;
    }

    // Subsections (numbered like "1." or ".1")
    if (/^\d+\s*\.|^\.\d+/.test(line)) {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += `<h3>${line}</h3>\n`;
      continue;
    }

    // Bullet points (● or -)
    if (line.startsWith('●') || (line.startsWith('-') && line.length > 2)) {
      const content = line.substring(1).trim();
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      html += `<li>${content}</li>\n`;
      continue;
    }

    // If not a bullet and we were in a list, close it
    if (inList && !line.startsWith('●') && !line.startsWith('-')) {
      html += '</ul>\n';
      inList = false;
    }

    // Regular paragraph
    if (line.length > 0) {
      html += `<p>${line}</p>\n`;
    }
  }

  // Close any open lists
  if (inList) {
    html += '</ul>\n';
  }

  html += '</div>';

  return html;
}

/**
 * Extract lesson number from filename
 */
function extractLessonNumber(filename) {
  const match = filename.match(/מערך\s*(\d+)/);
  return match ? match[1] : null;
}

/**
 * Extract text from PDF using pdfjs-dist
 */
async function extractTextFromPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = new Uint8Array(dataBuffer);
  
  const loadingTask = getDocument({
    data,
    verbosity: 0, // Suppress console output
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

/**
 * Import all lesson plans
 */
async function importAllLessonContents() {
  console.log('📚 Starting import of all lesson plan contents...\n');

  // Get all lesson plans from DB
  const { data: lessonPlans, error } = await supabase
    .from('lesson_plans')
    .select('id, name, week_number')
    .order('week_number');

  if (error || !lessonPlans) {
    console.error('❌ Error fetching lesson plans:', error);
    return;
  }

  console.log(`Found ${lessonPlans.length} lesson plans in DB\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const folder of LESSON_FOLDERS) {
    console.log(`\n📁 Processing folder: ${folder.prefix}`);

    const folderPath = path.join(process.cwd(), folder.path);

    if (!fs.existsSync(folderPath)) {
      console.log(`   ⚠️  Folder not found, skipping...`);
      continue;
    }

    const files = fs.readdirSync(folderPath);
    const pdfFiles = files.filter(f => f.endsWith('.pdf'));

    console.log(`   Found ${pdfFiles.length} PDF files`);

    for (const pdfFile of pdfFiles) {
      const lessonNumber = extractLessonNumber(pdfFile);

      if (!lessonNumber) {
        console.log(`   ⚠️  Could not extract lesson number from: ${pdfFile}`);
        skipped++;
        continue;
      }

      const lessonName = `${folder.prefix} ${lessonNumber}`;

      // Find matching lesson plan in DB
      const lessonPlan = lessonPlans.find(lp => lp.name === lessonName);

      if (!lessonPlan) {
        console.log(`   ⚠️  No DB match for: ${lessonName}`);
        skipped++;
        continue;
      }

      // Read PDF file
      const pdfPath = path.join(folderPath, pdfFile);

      try {
        // Extract text from PDF
        const pdfText = await extractTextFromPDF(pdfPath);

        // Convert to HTML
        const htmlContent = convertToBasicHTML(pdfText);

        // Update database
        const { error: updateError } = await supabase
          .from('lesson_plans')
          .update({ content: htmlContent })
          .eq('id', lessonPlan.id);

        if (updateError) {
          console.error(`   ❌ Error updating ${lessonName}:`, updateError);
          errors++;
        } else {
          console.log(`   ✅ Updated: ${lessonName}`);
          updated++;
        }
      } catch (err) {
        console.error(`   ❌ Error processing ${lessonName}:`, err.message);
        errors++;
      }
    }
  }

  console.log(`\n\n📊 Final Summary:`);
  console.log(`   ✅ Successfully updated: ${updated}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`\n✨ Import complete!`);
}

// Run the import
importAllLessonContents()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
