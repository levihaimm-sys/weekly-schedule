/**
 * Utility to load structured lesson plans from JSON files
 */

import type { StructuredLessonPlan } from '@/types/lesson-plan';
import fs from 'fs';
import path from 'path';

/**
 * Load a lesson plan by ID from JSON files
 */
export function loadLessonPlan(lessonPlanId: string): StructuredLessonPlan | null {
  try {
    const filePath = path.join(
      process.cwd(),
      'src',
      'data',
      'lesson-plans',
      `lesson-${lessonPlanId}.json`
    );

    if (!fs.existsSync(filePath)) {
      console.error(`Lesson plan file not found: ${filePath}`);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lessonPlan = JSON.parse(content) as StructuredLessonPlan;

    // Clean up the data
    return {
      ...lessonPlan,
      goals: lessonPlan.goals?.map(cleanText),
      sections: lessonPlan.sections.map((section) => ({
        title: cleanText(section.title),
        content: section.content, // Keep HTML content as-is for rendering
      })),
    };
  } catch (error) {
    console.error(`Error loading lesson plan ${lessonPlanId}:`, error);
    return null;
  }
}

/**
 * Clean text by removing extra whitespace, bullets, etc.
 */
function cleanText(text: string): string {
  return text
    .replace(/^[•\s\n]+/, '') // Remove leading bullets and whitespace
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Get all available lesson plan IDs
 */
export function getAllLessonPlanIds(): string[] {
  try {
    const dirPath = path.join(process.cwd(), 'src', 'data', 'lesson-plans');
    const files = fs.readdirSync(dirPath);

    return files
      .filter((file) => file.startsWith('lesson-') && file.endsWith('.json'))
      .map((file) => file.replace('lesson-', '').replace('.json', ''));
  } catch (error) {
    console.error('Error reading lesson plans directory:', error);
    return [];
  }
}
