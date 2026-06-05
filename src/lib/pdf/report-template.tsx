import React from "react";
import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// Register Hebrew font using local TTF files
const fontsDir = path.join(process.cwd(), "public", "fonts");
Font.register({
  family: "Heebo",
  fonts: [
    {
      src: path.join(fontsDir, "Heebo-Regular.ttf"),
      fontWeight: 400,
    },
    {
      src: path.join(fontsDir, "Heebo-Bold.ttf"),
      fontWeight: 700,
    },
  ],
});

// Prevent react-pdf's Latin hyphenation from mangling RTL characters
Font.registerHyphenationCallback((word) => [word]);

// Simple numeric date string to avoid toLocaleDateString injecting Hebrew bidi marks
function todayStr(): string {
  const d = new Date();
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Heebo",
    fontSize: 10,
    padding: 40,
    direction: "rtl",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
    direction: "rtl",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    direction: "rtl",
    textAlign: "center",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 10,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#2563eb",
    padding: 6,
  },
  tableHeaderText: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 9,
    textAlign: "center",
    direction: "rtl",
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e4e4e7",
    padding: 5,
    minHeight: 28,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#f9f9fb",
  },
  cell: {
    textAlign: "center",
    fontSize: 9,
    direction: "rtl",
  },
  colDate: { width: "12%" },
  colDay: { width: "10%" },
  colTime: { width: "8%" },
  colLocation: { width: "22%" },
  colCity: { width: "12%" },
  colStatus: { width: "10%" },
  colSignature: { width: "26%" },
  signatureImage: {
    width: 60,
    height: 25,
    objectFit: "contain",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
    direction: "rtl",
  },
  summary: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f4f4f5",
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 10,
    direction: "rtl",
  },
});

// Inline style for stat segments inside row-reverse summary rows
const seg = { fontSize: 10, fontFamily: "Heebo" } as const;

const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const MONTHS_HEBREW = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

interface LessonRow {
  date: string;
  dayOfWeek: number;
  time: string;
  locationName: string;
  city: string;
  status: string;
  signatureUrl?: string | null;
  signerName?: string | null;
  signerRole?: string | null;
}

interface ReportData {
  instructorName: string;
  month: number;
  year: number;
  lessons: LessonRow[];
}

function statusToHebrew(status: string) {
  const map: Record<string, string> = {
    scheduled: "מתוכנן",
    completed: "הושלם",
    cancelled: "בוטל",
    substitute: "מחליף",
  };
  return map[status] ?? status;
}

// ─── Client Report ───────────────────────────────────────────────────────────

interface ClientLessonRow {
  date: string;
  dayOfWeek: number;
  time: string;
  locationName: string;
  instructorName: string;
  status: string;
  signatureUrl?: string | null;
  signerName?: string | null;
  signerRole?: string | null;
}

interface ClientCitySection {
  city: string;
  total: number;
  completed: number;
  cancelled: number;
  teacherConfirmed: number;
  instructorConfirmed: number;
  lessons?: ClientLessonRow[];
}

interface ClientReportDocumentData {
  clientName: string;
  month: number;
  year: number;
  mode: "full" | "summary";
  cities: ClientCitySection[];
}

const cityHeaderStyle = StyleSheet.create({
  box: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 3,
  },
  text: { fontWeight: 700, fontSize: 10, direction: "rtl" },
});

export function ClientReportDocument({
  data,
}: {
  data: ClientReportDocumentData;
}) {
  const totals = {
    total: data.cities.reduce((s, c) => s + c.total, 0),
    completed: data.cities.reduce((s, c) => s + c.completed, 0),
    cancelled: data.cities.reduce((s, c) => s + c.cancelled, 0),
    teacherConfirmed: data.cities.reduce((s, c) => s + c.teacherConfirmed, 0),
    instructorConfirmed: data.cities.reduce(
      (s, c) => s + c.instructorConfirmed,
      0
    ),
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>חיים בתנועה - דוח לקוח חודשי</Text>
          <Text style={styles.subtitle}>{data.clientName}</Text>
          <Text style={styles.subtitle}>{MONTHS_HEBREW[data.month - 1]} {String(data.year)}</Text>
        </View>

        <View style={styles.divider} />

        {data.mode === "full" ? (
          // Full mode — lesson table per city
          data.cities.map((cityData, ci) => (
            <View key={ci}>
              <View
                style={[cityHeaderStyle.box, ci > 0 ? { marginTop: 14 } : {}]}
              >
                <Text style={cityHeaderStyle.text}>{cityData.city}</Text>
                {/* Stats row — row-reverse so each segment positions RTL without mixed bidi strings */}
                <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", marginTop: 2 }}>
                  <Text style={[seg, { fontSize: 8, color: "#4b5563" }]}>{'סה"כ: '}</Text>
                  <Text style={[seg, { fontSize: 8, color: "#4b5563" }]}>{cityData.total}</Text>
                  <Text style={[seg, { fontSize: 8, color: "#4b5563" }]}>{' | הושלמו: '}</Text>
                  <Text style={[seg, { fontSize: 8, color: "#4b5563" }]}>{cityData.completed}</Text>
                  <Text style={[seg, { fontSize: 8, color: "#4b5563" }]}>{' | בוטלו: '}</Text>
                  <Text style={[seg, { fontSize: 8, color: "#4b5563" }]}>{cityData.cancelled}</Text>
                  <Text style={[seg, { fontSize: 8, color: "#4b5563" }]}>{' | גננת: '}</Text>
                  <Text style={[seg, { fontSize: 8, color: "#4b5563" }]}>{cityData.teacherConfirmed}</Text>
                  <Text style={[seg, { fontSize: 8, color: "#4b5563" }]}>{' | מדריכה: '}</Text>
                  <Text style={[seg, { fontSize: 8, color: "#4b5563" }]}>{cityData.instructorConfirmed}</Text>
                </View>
              </View>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.colDate]}>
                    תאריך
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.colDay]}>
                    יום
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.colTime]}>
                    שעה
                  </Text>
                  <Text
                    style={[styles.tableHeaderText, styles.colLocation]}
                  >
                    מיקום
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "14%" }]}>
                    מדריכה
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.colStatus]}>
                    סטטוס
                  </Text>
                  <Text
                    style={[styles.tableHeaderText, styles.colSignature]}
                  >
                    אישור
                  </Text>
                </View>
                {(cityData.lessons ?? []).map((lesson, i) => (
                  <View
                    key={i}
                    style={[
                      styles.tableRow,
                      i % 2 === 1 ? styles.tableRowAlt : {},
                    ]}
                  >
                    <Text style={[styles.cell, styles.colDate]}>
                      {lesson.date}
                    </Text>
                    <Text style={[styles.cell, styles.colDay]}>
                      {HEBREW_DAYS[lesson.dayOfWeek]}
                    </Text>
                    <Text style={[styles.cell, styles.colTime]}>
                      {lesson.time}
                    </Text>
                    <Text style={[styles.cell, styles.colLocation]}>
                      {lesson.locationName}
                    </Text>
                    <Text style={[styles.cell, { width: "14%" }]}>
                      {lesson.instructorName}
                    </Text>
                    <Text style={[styles.cell, styles.colStatus]}>
                      {statusToHebrew(lesson.status)}
                    </Text>
                    <View style={[styles.colSignature, { alignItems: "center" }]}>
                      {lesson.signerRole === "teacher" ? (
                        <View style={{ alignItems: "center" }}>
                          {lesson.signatureUrl ? (
                            <Image
                              src={lesson.signatureUrl}
                              style={styles.signatureImage}
                            />
                          ) : null}
                          <Text
                            style={[styles.cell, { fontSize: 7, color: "#666" }]}
                          >
                            {`גננת: ${lesson.signerName}`}
                          </Text>
                        </View>
                      ) : lesson.signerRole === "instructor" ? (
                        <Text style={[styles.cell, { color: "#2563eb" }]}>
                          {"✓"} מדריכה
                        </Text>
                      ) : (
                        <Text style={[styles.cell, { color: "#999" }]}>—</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          // Summary mode — one row per city
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { width: "22%" }]}>
                עיר
              </Text>
              <Text style={[styles.tableHeaderText, { width: "13%" }]}>
                {'סה"כ'}
              </Text>
              <Text style={[styles.tableHeaderText, { width: "13%" }]}>
                הושלמו
              </Text>
              <Text style={[styles.tableHeaderText, { width: "13%" }]}>
                בוטלו
              </Text>
              <Text style={[styles.tableHeaderText, { width: "19%" }]}>
                אישור גננת
              </Text>
              <Text style={[styles.tableHeaderText, { width: "20%" }]}>
                אישור מדריכה
              </Text>
            </View>
            {data.cities.map((cityData, i) => (
              <View
                key={i}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.cell, { width: "22%", fontWeight: 700 }]}>
                  {cityData.city}
                </Text>
                <Text style={[styles.cell, { width: "13%" }]}>
                  {cityData.total}
                </Text>
                <Text style={[styles.cell, { width: "13%", color: "#16a34a" }]}>
                  {cityData.completed}
                </Text>
                <Text style={[styles.cell, { width: "13%", color: "#dc2626" }]}>
                  {cityData.cancelled}
                </Text>
                <Text style={[styles.cell, { width: "19%" }]}>
                  {cityData.teacherConfirmed}
                </Text>
                <Text style={[styles.cell, { width: "20%" }]}>
                  {cityData.instructorConfirmed}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.summary, { marginTop: 16 }]}>
          <View style={{ flexDirection: "row-reverse", flexWrap: "wrap" }}>
            <Text style={seg}>{'סה"כ: '}</Text>
            <Text style={seg}>{totals.total}</Text>
            <Text style={seg}>{' | הושלמו: '}</Text>
            <Text style={seg}>{totals.completed}</Text>
            <Text style={seg}>{' | בוטלו: '}</Text>
            <Text style={seg}>{totals.cancelled}</Text>
            <Text style={seg}>{' | אישור גננת: '}</Text>
            <Text style={seg}>{totals.teacherConfirmed}</Text>
            <Text style={seg}>{' | אישור מדריכה: '}</Text>
            <Text style={seg}>{totals.instructorConfirmed}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>הופק אוטומטית על ידי מערכת חיים בתנועה</Text>
          <Text>{todayStr()}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Location Report ────────────────────────────────────────────────────────

interface LocationLessonRow {
  date: string;
  dayOfWeek: number;
  time: string;
  instructorName: string;
  status: string;
  signatureUrl?: string | null;
  signerName?: string | null;
  signerRole?: string | null;
}

interface LocationReportData {
  locationName: string;
  city: string;
  month: number;
  year: number;
  lessons: LocationLessonRow[];
}

export function LocationReportDocument({ data }: { data: LocationReportData }) {
  const completed = data.lessons.filter((l) => l.status === "completed").length;
  const cancelled = data.lessons.filter((l) => l.status === "cancelled").length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>חיים בתנועה - דוח לקוח חודשי</Text>
          <Text style={styles.subtitle}>{data.locationName} — {data.city}</Text>
          <Text style={styles.subtitle}>{MONTHS_HEBREW[data.month - 1]} {String(data.year)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDate]}>תאריך</Text>
            <Text style={[styles.tableHeaderText, styles.colDay]}>יום</Text>
            <Text style={[styles.tableHeaderText, styles.colTime]}>שעה</Text>
            <Text style={[styles.tableHeaderText, { width: "30%" }]}>מדריך</Text>
            <Text style={[styles.tableHeaderText, styles.colStatus]}>סטטוס</Text>
            <Text style={[styles.tableHeaderText, styles.colSignature]}>אישור</Text>
          </View>

          {data.lessons.map((lesson, i) => (
            <View
              key={i}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.cell, styles.colDate]}>{lesson.date}</Text>
              <Text style={[styles.cell, styles.colDay]}>{HEBREW_DAYS[lesson.dayOfWeek]}</Text>
              <Text style={[styles.cell, styles.colTime]}>{lesson.time}</Text>
              <Text style={[styles.cell, { width: "30%" }]}>{lesson.instructorName}</Text>
              <Text style={[styles.cell, styles.colStatus]}>{statusToHebrew(lesson.status)}</Text>
              <View style={[styles.colSignature, { alignItems: "center" }]}>
                {lesson.signerRole === "teacher" ? (
                  <View style={{ alignItems: "center" }}>
                    {lesson.signatureUrl ? (
                      <Image src={lesson.signatureUrl} style={styles.signatureImage} />
                    ) : null}
                    <Text style={[styles.cell, { fontSize: 7, color: "#666" }]}>
                      {`גננת: ${lesson.signerName}`}
                    </Text>
                  </View>
                ) : lesson.signerRole === "instructor" ? (
                  <Text style={[styles.cell, { color: "#2563eb" }]}>{"✓"} מדריכה</Text>
                ) : (
                  <Text style={[styles.cell, { color: "#999" }]}>—</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={{ flexDirection: "row-reverse", flexWrap: "wrap" }}>
            <Text style={seg}>{'סה"כ שיעורים: '}</Text>
            <Text style={seg}>{data.lessons.length}</Text>
            <Text style={seg}>{' | הושלמו: '}</Text>
            <Text style={seg}>{completed}</Text>
            <Text style={seg}>{' | בוטלו: '}</Text>
            <Text style={seg}>{cancelled}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>הופק אוטומטית על ידי מערכת חיים בתנועה</Text>
          <Text>{todayStr()}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── City Report ─────────────────────────────────────────────────────────────

interface CityLessonRow {
  date: string;
  dayOfWeek: number;
  time: string;
  locationName: string;
  instructorName: string;
  status: string;
  signatureUrl?: string | null;
  signerName?: string | null;
  signerRole?: string | null;
}

interface CityReportData {
  city: string;
  month: number;
  year: number;
  lessons: CityLessonRow[];
}

export function CityReportDocument({ data }: { data: CityReportData }) {
  const completed = data.lessons.filter((l) => l.status === "completed").length;
  const cancelled = data.lessons.filter((l) => l.status === "cancelled").length;
  const teacherConfirmed = data.lessons.filter((l) => l.signerRole === "teacher").length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>חיים בתנועה - דוח עיר חודשי</Text>
          <Text style={styles.subtitle}>{data.city}</Text>
          <Text style={styles.subtitle}>{MONTHS_HEBREW[data.month - 1]} {String(data.year)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDate]}>תאריך</Text>
            <Text style={[styles.tableHeaderText, styles.colDay]}>יום</Text>
            <Text style={[styles.tableHeaderText, styles.colTime]}>שעה</Text>
            <Text style={[styles.tableHeaderText, { width: "20%" }]}>מיקום</Text>
            <Text style={[styles.tableHeaderText, { width: "16%" }]}>מדריך</Text>
            <Text style={[styles.tableHeaderText, styles.colStatus]}>סטטוס</Text>
            <Text style={[styles.tableHeaderText, styles.colSignature]}>אישור</Text>
          </View>

          {data.lessons.map((lesson, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.cell, styles.colDate]}>{lesson.date}</Text>
              <Text style={[styles.cell, styles.colDay]}>{HEBREW_DAYS[lesson.dayOfWeek]}</Text>
              <Text style={[styles.cell, styles.colTime]}>{lesson.time}</Text>
              <Text style={[styles.cell, { width: "20%" }]}>{lesson.locationName}</Text>
              <Text style={[styles.cell, { width: "16%" }]}>{lesson.instructorName}</Text>
              <Text style={[styles.cell, styles.colStatus]}>{statusToHebrew(lesson.status)}</Text>
              <View style={[styles.colSignature, { alignItems: "center" }]}>
                {lesson.signerRole === "teacher" ? (
                  <View style={{ alignItems: "center" }}>
                    {lesson.signatureUrl ? (
                      <Image src={lesson.signatureUrl} style={styles.signatureImage} />
                    ) : null}
                    <Text style={[styles.cell, { fontSize: 7, color: "#666" }]}>
                      {`גננת: ${lesson.signerName}`}
                    </Text>
                  </View>
                ) : lesson.signerRole === "instructor" ? (
                  <Text style={[styles.cell, { color: "#2563eb" }]}>{"✓"} מדריכה</Text>
                ) : (
                  <Text style={[styles.cell, { color: "#999" }]}>—</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={{ flexDirection: "row-reverse", flexWrap: "wrap" }}>
            <Text style={seg}>{'סה"כ שיעורים: '}</Text>
            <Text style={seg}>{data.lessons.length}</Text>
            <Text style={seg}>{' | הושלמו: '}</Text>
            <Text style={seg}>{completed}</Text>
            <Text style={seg}>{' | בוטלו: '}</Text>
            <Text style={seg}>{cancelled}</Text>
            <Text style={seg}>{' | אישור גננת: '}</Text>
            <Text style={seg}>{teacherConfirmed}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>הופק אוטומטית על ידי מערכת חיים בתנועה</Text>
          <Text>{todayStr()}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Instructor Report ───────────────────────────────────────────────────────

export function MonthlyReportDocument({ data }: { data: ReportData }) {
  const completed = data.lessons.filter((l) => l.status === "completed").length;
  const cancelled = data.lessons.filter((l) => l.status === "cancelled").length;
  const teacherConfirmed = data.lessons.filter((l) => l.signerRole === "teacher").length;
  const instructorConfirmed = data.lessons.filter((l) => l.signerRole === "instructor").length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>חיים בתנועה - דוח חודשי</Text>
          <Text style={styles.subtitle}>{data.instructorName}</Text>
          <Text style={styles.subtitle}>{MONTHS_HEBREW[data.month - 1]} {String(data.year)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDate]}>תאריך</Text>
            <Text style={[styles.tableHeaderText, styles.colDay]}>יום</Text>
            <Text style={[styles.tableHeaderText, styles.colTime]}>שעה</Text>
            <Text style={[styles.tableHeaderText, styles.colLocation]}>
              מיקום
            </Text>
            <Text style={[styles.tableHeaderText, styles.colCity]}>עיר</Text>
            <Text style={[styles.tableHeaderText, styles.colStatus]}>
              סטטוס
            </Text>
            <Text style={[styles.tableHeaderText, styles.colSignature]}>
              אישור
            </Text>
          </View>

          {/* Data Rows */}
          {data.lessons.map((lesson, i) => (
            <View
              key={i}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.cell, styles.colDate]}>{lesson.date}</Text>
              <Text style={[styles.cell, styles.colDay]}>
                {HEBREW_DAYS[lesson.dayOfWeek]}
              </Text>
              <Text style={[styles.cell, styles.colTime]}>{lesson.time}</Text>
              <Text style={[styles.cell, styles.colLocation]}>
                {lesson.locationName}
              </Text>
              <Text style={[styles.cell, styles.colCity]}>{lesson.city}</Text>
              <Text style={[styles.cell, styles.colStatus]}>
                {statusToHebrew(lesson.status)}
              </Text>
              <View style={[styles.colSignature, { alignItems: "center" }]}>
                {lesson.signerRole === "teacher" ? (
                  <View style={{ alignItems: "center" }}>
                    {lesson.signatureUrl ? (
                      <Image
                        src={lesson.signatureUrl}
                        style={styles.signatureImage}
                      />
                    ) : null}
                    <Text style={[styles.cell, { fontSize: 7, color: "#666" }]}>
                      {`גננת: ${lesson.signerName}`}
                    </Text>
                  </View>
                ) : lesson.signerRole === "instructor" ? (
                  <Text style={[styles.cell, { color: "#2563eb" }]}>
                    {"✓"} מדריכה
                  </Text>
                ) : (
                  <Text style={[styles.cell, { color: "#999" }]}>—</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={{ flexDirection: "row-reverse", flexWrap: "wrap" }}>
            <Text style={seg}>{'סה"כ שיעורים: '}</Text>
            <Text style={seg}>{data.lessons.length}</Text>
            <Text style={seg}>{' | הושלמו: '}</Text>
            <Text style={seg}>{completed}</Text>
            <Text style={seg}>{' | בוטלו: '}</Text>
            <Text style={seg}>{cancelled}</Text>
            <Text style={seg}>{' | אישור גננת: '}</Text>
            <Text style={seg}>{teacherConfirmed}</Text>
            <Text style={seg}>{' | אישור מדריכה: '}</Text>
            <Text style={seg}>{instructorConfirmed}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>הופק אוטומטית על ידי מערכת חיים בתנועה</Text>
          <Text>{todayStr()}</Text>
        </View>
      </Page>
    </Document>
  );
}
