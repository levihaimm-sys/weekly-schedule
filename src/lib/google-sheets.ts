import { createAdminClient } from "@/lib/supabase/admin";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL!;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY!.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );

  const crypto = await import("crypto");
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  signer.end();
  const signature = base64url(signer.sign(privateKey));

  const jwt = `${header}.${payload}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

const SHEET_HEADERS = [
  "תאריך תחילת שבוע",
  "מדריך",
  "מסלול",
  "תוכנית שיעור",
  "קטגוריה",
  "ציוד",
  "מלאי כולל",
  "כמות צפויה",
  "כמות שהתקבלה",
  "אושר",
  "תאריך אישור",
  "תוספת",
  "הערות",
  "חולק",
  "תאריך חלוקה",
];

export async function syncEquipmentDistributionToSheet() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Sheet1";

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("equipment_distribution_live")
    .select("*")
    .order("week_start_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to read equipment_distribution_live: ${error.message}`);
  }

  const rows = (data || []).map((r: any) => [
    r.week_start_date,
    r.instructor_name,
    r.route,
    r.lesson_plan_name,
    r.lesson_plan_category,
    r.equipment_name,
    r.total_stock,
    r.expected_quantity,
    r.received_quantity,
    r.is_confirmed,
    r.confirmed_at,
    r.is_extra,
    r.notes,
    r.equipment_distributed,
    r.equipment_distributed_at,
  ]);

  const accessToken = await getAccessToken();

  // Clear the sheet first so a shrinking result set doesn't leave stale rows behind.
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}:clear`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [SHEET_HEADERS, ...rows] }),
    }
  );

  if (!updateRes.ok) {
    throw new Error(`Sheets update failed: ${updateRes.status} ${await updateRes.text()}`);
  }

  return { rowCount: rows.length };
}
