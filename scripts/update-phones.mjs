import { createClient } from "@supabase/supabase-js";

const url = "https://gkkylaztfhasasndnfbg.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdra3lsYXp0Zmhhc2FzbmRuZmJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMxMTY5MSwiZXhwIjoyMDg1ODg3NjkxfQ.Le79eV54fqEIQSdt1RHnXh4N8GO5D2hYEoCSwtmesrY";

const supabase = createClient(url, serviceKey);

const phoneMap = [
  ["אריאל ברמן", "0538274673"],
  ["הדר הראל", "0507320042"],
  ["חוי פוקס", "0528508064"],
  ["טל שומרת", "0523606342"],
  ["טליה דודזון", "0528250825"],
  ["כרמל שביט", "0545256147"],
  ["סתיו דהן", "0523197739"],
  ["עליזה אברבנל", "0528479209"],
  ["קרן ינוב", "0547567135"],
  ["רותם שן", "0526002666"],
  ["רמי שמש", "0555579952"],
  ["נויה יחזקאל", "0503320302"],
  ["אורית צ'אקל", "0542810151"],
  ["איב אוחיון", "0524075797"],
];

async function main() {
  // Update phone numbers
  console.log("\nUpdating phone numbers...");

  let updated = 0;
  let notFound = [];

  for (const [name, phone] of phoneMap) {
    const { data, error } = await supabase
      .from("instructors")
      .update({ phone })
      .eq("full_name", name)
      .select("id, full_name");

    if (error) {
      console.log(`  Error updating ${name}: ${error.message}`);
    } else if (!data || data.length === 0) {
      notFound.push(name);
    } else {
      console.log(`  ✓ ${name} → ${phone}`);
      updated++;
    }
  }

  console.log(`\nUpdated: ${updated}/${phoneMap.length}`);

  if (notFound.length > 0) {
    console.log(`\nNot found (checking partial match):`);
    for (const name of notFound) {
      // Try partial match
      const { data } = await supabase
        .from("instructors")
        .select("id, full_name")
        .ilike("full_name", `%${name.split(" ")[0]}%`);

      if (data && data.length > 0) {
        console.log(`  "${name}" → possible matches: ${data.map(d => d.full_name).join(", ")}`);
        // Update the first match
        const phone = phoneMap.find(([n]) => n === name)?.[1];
        if (phone && data.length === 1) {
          await supabase
            .from("instructors")
            .update({ phone })
            .eq("id", data[0].id);
          console.log(`    → Auto-updated ${data[0].full_name} → ${phone}`);
        }
      } else {
        console.log(`  "${name}" → no match found at all`);
      }
    }
  }

  // 3. Show all instructors with phones
  console.log("\n--- All instructors ---");
  const { data: all } = await supabase
    .from("instructors")
    .select("full_name, phone")
    .order("full_name");

  for (const inst of all ?? []) {
    console.log(`  ${inst.full_name}: ${inst.phone || "(no phone)"}`);
  }
}

main().catch(console.error);
