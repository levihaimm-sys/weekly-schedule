/**
 * Script to extract lesson plans from database HTML and convert to structured JSON
 * Run with: npx tsx scripts/extract-lesson-plans.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import type { StructuredLessonPlan, LessonPlanSection, LessonPlanEquipment } from '../src/types/lesson-plan';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Initialize Supabase client with SERVICE ROLE KEY (bypasses RLS for scripts)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('   Make sure .env.local contains:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY (not ANON_KEY)');
  console.error('\n💡 Get the service role key from:');
  console.error('   Supabase Dashboard > Project Settings > API > Service Role Key');
  process.exit(1);
}

console.log('✅ Using service role key for database access');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Parse HTML content and extract structured data
 * NEW APPROACH: Only remove unwanted sections, keep everything else
 */
function parseHtmlContent(html: string): {
  goals: string[];
  sections: LessonPlanSection[];
  duration?: string;
} {
  const $ = cheerio.load(html);
  const sections: LessonPlanSection[] = [];
  let duration: string | undefined;

  // STEP 1: Remove ONLY unwanted sections (don't extract yet, just remove)
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const heading = $(el);
    const text = heading.text().trim();

    // Remove "מערך X" headings (duplicates)
    if (/מערך\s*\d+/.test(text)) {
      heading.remove();
      return;
    }

    // Remove "זמן מערך" / "זמן שיעור" and extract duration
    if (/זמן\s*(מערך|שיעור)/.test(text)) {
      // Try to find duration in next paragraph
      const nextP = heading.next('p');
      if (nextP.length) {
        const durationText = nextP.text().trim();
        if (/\d+[-–]\d+\s*דקות/.test(durationText)) {
          duration = durationText;
          nextP.remove();
        }
      }
      heading.remove();
      return;
    }

    // Remove "חותמת" sections
    if (/חותמת/.test(text)) {
      let next = heading.next();
      while (next.length && !next.is('h1, h2, h3, h4, h5, h6')) {
        const toRemove = next;
        next = next.next();
        toRemove.remove();
      }
      heading.remove();
      return;
    }
  });

  // STEP 2: Extract ALL remaining sections (keep headings and content together)
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const heading = $(el);
    const title = heading.text().trim();

    if (!title) return;

    let content = '';
    let next = heading.next();

    while (next.length && !next.is('h1, h2, h3, h4, h5, h6')) {
      // Get the outer HTML (includes the tag itself, not just inner content)
      const outerHtml = $.html(next);
      if (outerHtml) {
        content += outerHtml + '\n';
      }
      next = next.next();
    }

    // Add section even if content is empty (heading-only sections)
    sections.push({
      title,
      content: content.trim(),
    });
  });

  // STEP 3: Clean up the HTML - remove Tailwind classes and style attributes
  function cleanHtml(html: string): string {
    let cleaned = html;

    // Remove class attributes entirely (they contain Tailwind classes that won't work)
    cleaned = cleaned.replace(/\s+class\s*=\s*["'][^"']*["']/gi, '');

    // Remove style attributes
    cleaned = cleaned.replace(/\s+style\s*=\s*["'][^"']*["']/gi, '');

    // Remove other styling attributes
    cleaned = cleaned.replace(/\s+(background|bgcolor|color|width|height)\s*=\s*["'][^"']*["']/gi, '');

    return cleaned;
  }

  // Clean all section content
  sections.forEach(section => {
    section.content = cleanHtml(section.content);
  });

  return { goals: [], sections, duration }; // No separate goals - they're in sections
}

/**
 * Main extraction function
 */
async function extractLessonPlans() {
  console.log('🔍 Fetching lesson plans from database...');

  // Fetch all lesson plans
  const { data: lessonPlans, error, status, statusText } = await supabase
    .from('lesson_plans')
    .select('id, name, content, playlist_url, pdf_path')
    .order('name');

  console.log('📊 Query result:', {
    dataLength: lessonPlans?.length || 0,
    hasError: !!error,
    status,
    statusText,
  });

  if (error) {
    console.error('❌ Error fetching lesson plans:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details);
    console.error('   Hint:', error.hint);
    console.error('\n💡 This might be an RLS (Row Level Security) issue.');
    console.error('   Check if the lesson_plans table has policies that require authentication.');
    process.exit(1);
  }

  if (!lessonPlans || lessonPlans.length === 0) {
    console.log('⚠️  No lesson plans found in database');
    console.log('   Status:', status, statusText);
    console.log('\n💡 Possible reasons:');
    console.log('   1. The table is empty');
    console.log('   2. RLS policies prevent anonymous access');
    console.log('   3. Supabase credentials are incorrect');
    return;
  }

  console.log(`✅ Found ${lessonPlans.length} lesson plans`);

  // Fetch equipment for each lesson plan
  const { data: equipmentData } = await supabase
    .from('lesson_plan_equipment')
    .select(`
      lesson_plan_id,
      quantity,
      equipment:equipment_id (
        id,
        name
      )
    `);

  // Map equipment by lesson plan ID
  const equipmentMap = new Map<string, LessonPlanEquipment[]>();
  if (equipmentData) {
    for (const item of equipmentData) {
      if (!equipmentMap.has(item.lesson_plan_id)) {
        equipmentMap.set(item.lesson_plan_id, []);
      }
      equipmentMap.get(item.lesson_plan_id)!.push({
        name: (item.equipment as any).name,
        quantity: item.quantity,
      });
    }
  }

  // Process each lesson plan
  const outputDir = path.join(process.cwd(), 'src', 'data', 'lesson-plans');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const plan of lessonPlans) {
    console.log(`\n📝 Processing: ${plan.name}`);

    // Parse HTML content
    const parsed = parseHtmlContent(plan.content || '');

    // Create structured data
    const structured: StructuredLessonPlan = {
      id: plan.id,
      name: plan.name,
      duration: parsed.duration,
      goals: parsed.goals.length > 0 ? parsed.goals : undefined,
      equipment: equipmentMap.get(plan.id) || [],
      sections: parsed.sections,
      notes: undefined,
      playlist_url: plan.playlist_url,
      pdf_path: plan.pdf_path,
    };

    // Save to JSON file
    const filename = `lesson-${plan.id}.json`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(structured, null, 2), 'utf-8');

    console.log(`   ✅ Saved to ${filename}`);
    console.log(`   📊 Goals: ${structured.goals?.length || 0}`);
    console.log(`   📦 Equipment: ${structured.equipment.length}`);
    console.log(`   📑 Sections: ${structured.sections.length}`);
  }

  console.log('\n✨ Done! All lesson plans extracted successfully.');
}

// Run the extraction
extractLessonPlans().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
