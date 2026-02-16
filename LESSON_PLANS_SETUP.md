# מערכת ניהול מערכי שיעור - הוראות התקנה

## סקירה כללית

מערכת זו מנהלת את מערכי השיעור, הציוד, וההקצאות השבועיות למדריכים.

## מבנה הטבלאות

### 1. `lesson_plans` - מערכי שיעור
- 53 מערכי שיעור שונים לאורך השנה
- כל מערך מסווג לפי נושא (פתיחת שנה, מיומנות יסוד, שיווי משקל, משחקי כדור, גמישות ותנועה)

### 2. `equipment` - ציוד
- רשימת כל סוגי הציוד (כדורים, חישוקים, מקלות וכו')

### 3. `lesson_plan_equipment` - ציוד לכל מערך
- מגדיר איזה ציוד נדרש לכל מערך שיעור
- כולל כמות וסוג (אביזרים/מסלול/חותמת)

### 4. `weekly_lesson_assignments` - הקצאות שבועיות
- מי מלמד איזה מערך בכל שבוע
- תומך בשינויים חד-פעמיים וקבועים

### 5. `equipment_confirmations` - אישורי קבלת ציוד
- מדריכים מאשרים קבלת ציוד ביום ראשון
- מועד אחרון: יום שני

## שלבי ההתקנה

### שלב 1: הרצת המיגריישן

```bash
# אם אתה משתמש ב-Supabase CLI
supabase db push

# או העתק את התוכן של:
# supabase/migrations/011_create_lesson_plans_system.sql
# והרץ ב-Supabase Dashboard
```

### שלב 2: התקנת תלויות

```bash
npm install
# או
pnpm install
```

### שלב 3: הגדרת משתני סביבה

ודא שיש לך את המשתנים הבאים ב-`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### שלב 4: ייבוא נתונים

**חשוב:** לפני הריצה, ודא שקבצי ה-CSV נמצאים בתיקייה `Lessons/`:
- `Lessons/Equipment List.csv`
- `Lessons/Annual Schedule.csv`

```bash
npm run import:lesson-plans
```

הסקריפט יבצע:
1. ייבוא 53 מערכי שיעור מ-Equipment List.csv
2. חילוץ וייצור של כל סוגי הציוד
3. יצירת קשרים בין מערכי שיעור לציוד
4. ייבוא הקצאות שבועיות מ-Annual Schedule.csv

## פתרון בעיות

### בעיה: הסקריפט לא מוצא את המדריכים

**פתרון:** ודא שהמדריכים קיימים בטבלת `instructors` עם שמות תואמים לאלה ב-Annual Schedule.csv

### בעיה: שגיאות בפרסור ה-CSV

**פתרון:** ודא שקבצי ה-CSV מקודדים ב-UTF-8 ולא מכילים תווים מיוחדים

### בעיה: Constraint violations

**פתרון:** ודא שאין נתונים כפולים ב-CSV

## מה הלאה?

לאחר הייבוא המוצלח:

1. **צפייה בנתונים**
   - היכנס ל-Supabase Dashboard
   - בדוק את הטבלאות החדשות

2. **בניית ממשק המשתמש**
   - צור דפים למדריכים לצפייה במערכים שלהם
   - צור דפים למנהלים לניהול ההקצאות
   - הוסף מערכת לאישור ציוד

3. **העלאת קבצי PDF**
   - העלה את קבצי המערכים ל-Supabase Storage
   - עדכן את השדה `pdf_path` בטבלת `lesson_plans`

## שאלות נפוצות

### איך אני משנה הקצאה לשבוע ספציפי?

```typescript
// שינוי חד-פעמי (לא משפיע על שאר השרשרת)
await supabase
  .from('weekly_lesson_assignments')
  .update({ 
    lesson_plan_id: 'new-lesson-id',
    is_permanent_change: false 
  })
  .eq('id', 'assignment-id');

// שינוי קבוע (משפיע על כל השרשרת)
await supabase
  .from('weekly_lesson_assignments')
  .update({ 
    lesson_plan_id: 'new-lesson-id',
    is_permanent_change: true 
  })
  .eq('id', 'assignment-id');
// ואז צריך לעדכן את כל ההקצאות הבאות בשרשרת
```

### איך אני רואה את הציוד החסר?

```typescript
// Query לראות הפרשים בציוד בין מדריכים
const { data } = await supabase
  .from('equipment_confirmations')
  .select(`
    *,
    equipment(name),
    assignment:weekly_lesson_assignments(
      week_start_date,
      instructor:instructors(full_name)
    )
  `)
  .neq('expected_quantity', 'received_quantity');
```

## תמיכה

לשאלות ובעיות, פנה למפתח המערכת.
