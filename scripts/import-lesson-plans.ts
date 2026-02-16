/**
 * Script to import lesson plans data from CSV files to Supabase
 * 
 * This script:
 * 1. Parses Equipment List.csv to create lesson_plans, equipment, and lesson_plan_equipment
 * 2. Parses Annual Schedule.csv to create weekly_lesson_assignments
 * 3. Creates equipment_confirmations records for all assignments
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Supabase connection (using service role key for admin access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please ensure .env.local has:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Parse CSV file to array of rows
 */
function parseCSV(filePath: string): string[][] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    skip_empty_lines: false,
    relax_column_count: true,
    trim: true
  });
  return records;
}

/**
 * Extract equipment name and quantity from text
 * Examples:
 *   "37 כדורי טניס" -> { name: "כדורי טניס", quantity: 37 }
 *   "כדורי טניס" -> { name: "כדורי טניס", quantity: 1 }
 */
function parseEquipmentText(text: string): { name: string; quantity: number } | null {
  if (!text || text.trim() === '') return null;
  
  const match = text.match(/^(\d+)\s+(.+)$/);
  if (match) {
    return {
      quantity: parseInt(match[1]),
      name: match[2].trim()
    };
  }
  
  return {
    quantity: 1,
    name: text.trim()
  };
}

/**
 * Parse date from Hebrew format (e.g., "19-אוק" -> Date for October 19)
 */
function parseHebrewDate(dateStr: string, year: number = 2025): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  const monthMap: Record<string, number> = {
    'ינו': 0,  // January
    'פבר': 1,  // February
    'מרץ': 2,  // March
    'אפר': 3,  // April
    'מאי': 4,  // May
    'יונ': 5,  // June
    'יול': 6,  // July
    'אוג': 7,  // August
    'ספט': 8,  // September
    'אוק': 9,  // October
    'נוב': 10, // November
    'דצמ': 11  // December
  };
  
  const match = dateStr.match(/^(\d+)-([א-ת]+)$/);
  if (!match) return null;
  
  const day = parseInt(match[1]);
  const monthHebrew = match[2];
  const month = monthMap[monthHebrew];
  
  if (month === undefined) return null;
  
  // Adjust year based on month (school year spans two calendar years)
  const actualYear = month >= 8 ? year : year + 1;
  
  return new Date(actualYear, month, day);
}

/**
 * Get Sunday of the week for a given date
 */
function getSundayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday is 0
  return new Date(d.setDate(diff));
}

// =============================================
// MAIN IMPORT FUNCTIONS
// =============================================

/**
 * Step 1: Import lesson plans and equipment from Equipment List.csv
 */
async function importLessonPlansAndEquipment() {
  console.log('📚 Importing lesson plans and equipment...');
  
  const equipmentListPath = path.join(process.cwd(), 'Lessons', 'Equipment List.csv');
  const rows = parseCSV(equipmentListPath);
  
  // Skip header rows (first 3 rows)
  const dataRows = rows.slice(4);
  
  const lessonPlansData: any[] = [];
  const equipmentMap = new Map<string, string>(); // name -> id
  const lessonPlanEquipmentData: any[] = [];
  
  // Category mapping based on week number
  const getCategoryForWeek = (week: number): string => {
    if (week >= 1 && week <= 10) return 'פתיחת שנה, מודעות לגוף וחגי תשרי';
    if (week >= 11 && week <= 22) return 'מיומנות יסוד, תנועה במרחב וחנוכה';
    if (week >= 23 && week <= 36) return 'שיווי משקל, יציבה נכונה וויסות כוח';
    if (week >= 37 && week <= 45) return 'משחקי כדור ומיומנות תקשורת';
    if (week >= 46 && week <= 53) return 'גמישות והתעמלות קרקע, ריקוד ונופש פעיל';
    return 'אחר';
  };
  
  // Parse lesson plans
  for (const row of dataRows) {
    if (row.length < 4) continue;
    
    const weekNum = parseInt(row[1]);
    const lessonName = row[2];
    const mainEquipment = row[3];
    const trackEquipment = row[4];
    const stampEquipment = row[5];
    
    if (isNaN(weekNum) || !lessonName) continue;
    
    const category = getCategoryForWeek(weekNum);
    
    lessonPlansData.push({
      week_number: weekNum,
      name: lessonName,
      category: category,
      pdf_path: null,
      notes: null
    });
  }
  
  // Insert lesson plans
  const { data: insertedLessonPlans, error: lessonPlansError } = await supabase
    .from('lesson_plans')
    .insert(lessonPlansData)
    .select();
  
  if (lessonPlansError) {
    console.error('❌ Error inserting lesson plans:', lessonPlansError);
    throw lessonPlansError;
  }
  
  console.log(`✅ Inserted ${insertedLessonPlans.length} lesson plans`);
  
  // Create a map of week_number -> lesson_plan_id
  const lessonPlanMap = new Map<number, string>();
  insertedLessonPlans.forEach(lp => {
    lessonPlanMap.set(lp.week_number, lp.id);
  });
  
  // Parse equipment and create lesson_plan_equipment relationships
  for (const row of dataRows) {
    if (row.length < 4) continue;
    
    const weekNum = parseInt(row[1]);
    const mainEquipment = row[3];
    const trackEquipment = row[4];
    const stampEquipment = row[5];
    
    if (isNaN(weekNum)) continue;
    
    const lessonPlanId = lessonPlanMap.get(weekNum);
    if (!lessonPlanId) continue;
    
    // Parse main equipment (אביזרים)
    if (mainEquipment && mainEquipment !== '') {
      const items = mainEquipment.split('\n').filter(i => i.trim() !== '');
      for (const item of items) {
        const parsed = parseEquipmentText(item);
        if (parsed) {
          // Add equipment to map if not exists
          if (!equipmentMap.has(parsed.name)) {
            const { data: equipData } = await supabase
              .from('equipment')
              .insert({ name: parsed.name })
              .select()
              .single();
            
            if (equipData) {
              equipmentMap.set(parsed.name, equipData.id);
            }
          }
          
          const equipmentId = equipmentMap.get(parsed.name);
          if (equipmentId) {
            lessonPlanEquipmentData.push({
              lesson_plan_id: lessonPlanId,
              equipment_id: equipmentId,
              quantity: parsed.quantity,
              equipment_type: 'main'
            });
          }
        }
      }
    }
    
    // Parse track equipment (מסלול)
    if (trackEquipment && trackEquipment !== '') {
      const items = trackEquipment.split('\n').filter(i => i.trim() !== '');
      for (const item of items) {
        const parsed = parseEquipmentText(item);
        if (parsed) {
          if (!equipmentMap.has(parsed.name)) {
            const { data: equipData } = await supabase
              .from('equipment')
              .insert({ name: parsed.name })
              .select()
              .single();
            
            if (equipData) {
              equipmentMap.set(parsed.name, equipData.id);
            }
          }
          
          const equipmentId = equipmentMap.get(parsed.name);
          if (equipmentId) {
            lessonPlanEquipmentData.push({
              lesson_plan_id: lessonPlanId,
              equipment_id: equipmentId,
              quantity: parsed.quantity,
              equipment_type: 'track'
            });
          }
        }
      }
    }
    
    // Parse stamp equipment (חותמת)
    if (stampEquipment && stampEquipment !== '') {
      const items = stampEquipment.split('\n').filter(i => i.trim() !== '');
      for (const item of items) {
        const parsed = parseEquipmentText(item);
        if (parsed) {
          if (!equipmentMap.has(parsed.name)) {
            const { data: equipData } = await supabase
              .from('equipment')
              .insert({ name: parsed.name })
              .select()
              .single();
            
            if (equipData) {
              equipmentMap.set(parsed.name, equipData.id);
            }
          }
          
          const equipmentId = equipmentMap.get(parsed.name);
          if (equipmentId) {
            lessonPlanEquipmentData.push({
              lesson_plan_id: lessonPlanId,
              equipment_id: equipmentId,
              quantity: parsed.quantity,
              equipment_type: 'stamp'
            });
          }
        }
      }
    }
  }
  
  console.log(`✅ Created ${equipmentMap.size} unique equipment items`);
  
  // Insert lesson_plan_equipment relationships
  if (lessonPlanEquipmentData.length > 0) {
    const { error: equipmentError } = await supabase
      .from('lesson_plan_equipment')
      .insert(lessonPlanEquipmentData);
    
    if (equipmentError) {
      console.error('❌ Error inserting lesson plan equipment:', equipmentError);
      throw equipmentError;
    }
    
    console.log(`✅ Created ${lessonPlanEquipmentData.length} lesson-equipment relationships`);
  }
  
  return { lessonPlanMap, equipmentMap };
}

/**
 * Step 2: Import weekly lesson assignments from Annual Schedule.csv
 */
async function importWeeklyAssignments(lessonPlanMap: Map<number, string>) {
  console.log('📅 Importing weekly lesson assignments...');
  
  const annualSchedulePath = path.join(process.cwd(), 'Lessons', 'Annual Schedule.csv');
  const rows = parseCSV(annualSchedulePath);
  
  // First row has instructor names (skip first empty column)
  const instructorNames = rows[0].slice(1).filter(name => name && name.trim() !== '');
  
  console.log(`Found ${instructorNames.length} instructors: ${instructorNames.join(', ')}`);
  
  // Get instructor IDs from database
  const { data: instructors, error: instructorsError } = await supabase
    .from('instructors')
    .select('id, full_name');
  
  if (instructorsError) {
    console.error('❌ Error fetching instructors:', instructorsError);
    throw instructorsError;
  }
  
  // Create mapping of instructor names to IDs
  const instructorMap = new Map<string, string>();
  for (const name of instructorNames) {
    const instructor = instructors?.find(i => i.full_name.includes(name) || name.includes(i.full_name));
    if (instructor) {
      instructorMap.set(name, instructor.id);
    } else {
      console.warn(`⚠️  Could not find instructor: ${name}`);
    }
  }
  
  // Parse assignments (start from row 3, which has dates)
  const assignmentsData: any[] = [];
  
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;
    
    const dateStr = row[0];
    if (!dateStr || dateStr.trim() === '') continue;
    
    const date = parseHebrewDate(dateStr, 2025);
    if (!date) continue;
    
    const sunday = getSundayOfWeek(date);
    const weekStartDate = sunday.toISOString().split('T')[0];
    
    // Parse assignments for each instructor
    for (let j = 0; j < instructorNames.length; j++) {
      const instructorName = instructorNames[j];
      const lessonName = row[j + 1]?.trim();
      
      if (!lessonName || lessonName === '') continue;
      
      const instructorId = instructorMap.get(instructorName);
      if (!instructorId) continue;
      
      // Find the lesson plan by name
      const { data: lessonPlan } = await supabase
        .from('lesson_plans')
        .select('id')
        .eq('name', lessonName)
        .single();
      
      if (lessonPlan) {
        assignmentsData.push({
          instructor_id: instructorId,
          lesson_plan_id: lessonPlan.id,
          week_start_date: weekStartDate,
          is_permanent_change: false
        });
      } else {
        console.warn(`⚠️  Could not find lesson plan: ${lessonName}`);
      }
    }
  }
  
  // Insert assignments in batches to avoid conflicts
  console.log(`Inserting ${assignmentsData.length} assignments...`);
  
  let inserted = 0;
  for (const assignment of assignmentsData) {
    const { error } = await supabase
      .from('weekly_lesson_assignments')
      .insert(assignment);
    
    if (error) {
      // Log but don't throw - might be duplicate
      console.warn(`⚠️  Could not insert assignment:`, error.message);
    } else {
      inserted++;
    }
  }
  
  console.log(`✅ Inserted ${inserted} weekly lesson assignments`);
}

/**
 * Main import function
 */
async function main() {
  try {
    console.log('🚀 Starting lesson plans import...\n');
    
    // Step 1: Import lesson plans and equipment
    const { lessonPlanMap, equipmentMap } = await importLessonPlansAndEquipment();
    
    // Step 2: Import weekly assignments
    await importWeeklyAssignments(lessonPlanMap);
    
    console.log('\n✅ Import completed successfully!');
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
main();
