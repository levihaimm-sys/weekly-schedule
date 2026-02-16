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
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
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
  },
  summary: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f4f4f5",
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 10,
    textAlign: "right",
  },
});

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
          <Text style={styles.subtitle}>
            {data.instructorName} | {MONTHS_HEBREW[data.month - 1]} {data.year}
          </Text>
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
                    {"\u2713"} מדריכה
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
          <Text style={styles.summaryText}>
            סה&quot;כ שיעורים: {data.lessons.length} | הושלמו: {completed} |
            בוטלו: {cancelled} | אישור גננת: {teacherConfirmed} | אישור
            מדריכה: {instructorConfirmed}
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          הופק אוטומטית על ידי מערכת חיים בתנועה |{" "}
          {new Date().toLocaleDateString("he-IL")}
        </Text>
      </Page>
    </Document>
  );
}
