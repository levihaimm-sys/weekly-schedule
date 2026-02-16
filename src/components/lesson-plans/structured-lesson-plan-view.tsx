/**
 * Component to render structured lesson plans from JSON
 * Replaces the old HTML dangerouslySetInnerHTML approach
 */

import type { StructuredLessonPlan } from '@/types/lesson-plan';

interface StructuredLessonPlanViewProps {
  lessonPlan: StructuredLessonPlan;
}

export function StructuredLessonPlanView({ lessonPlan }: StructuredLessonPlanViewProps) {
  // Main headings that should have styled background
  const mainHeadings = ['ציוד', 'מטרת המפגש', 'מטרות המפגש', 'פתיחה', 'גוף השיעור', 'מסלול', 'סיכום'];

  const isMainHeading = (title: string) => {
    const cleanTitle = title.replace(/[^\u0590-\u05FF\s]/g, '').trim(); // Remove emojis and special chars
    return mainHeadings.some(heading => cleanTitle.includes(heading));
  };

  return (
    <div className="space-y-6">
      {/* All sections with their headings */}
      {lessonPlan.sections
        .filter(section => {
          // Skip "ציוד" section (equipment is shown separately in the page)
          const cleanTitle = section.title.replace(/[^\u0590-\u05FF\s]/g, '').trim();
          if (cleanTitle.includes('ציוד')) return false;

          // Skip sections with empty content (no point showing them)
          if (!section.content || section.content.trim() === '') return false;

          return true;
        })
        .map((section, idx) => {
          const isMain = isMainHeading(section.title);

          return (
            <div key={idx} className="space-y-3">
              {/* Conditional heading styling - main headings get background */}
              {isMain ? (
                <div className="bg-accent/30 rounded-2xl px-5 py-3 border-r-4 border-accent">
                  <h3 className="text-xl font-bold text-foreground">{section.title}</h3>
                </div>
              ) : (
                <h4 className="text-lg font-bold text-foreground">{section.title}</h4>
              )}

              {/* Section content */}
              <div
                className="text-base font-medium text-foreground leading-relaxed pr-2"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          );
        })}
    </div>
  );
}
