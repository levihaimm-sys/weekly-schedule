import { createClient } from "@/lib/supabase/server";
import { LocationCard } from "@/components/locations/location-card";

export default async function LocationsPage() {
  const supabase = await createClient();

  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, city, street, age_group, notes, hide_notes_from_instructor")
    .order("city")
    .order("name");

  // Group by city
  const byCity: Record<string, typeof locations> = {};
  for (const loc of locations ?? []) {
    if (!byCity[loc.city]) byCity[loc.city] = [];
    byCity[loc.city]!.push(loc);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">מיקומים</h2>

      {Object.entries(byCity).map(([city, locs]) => (
        <div key={city}>
          <h3 className="mb-3 text-lg font-semibold">{city}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(locs ?? []).map((loc) => (
              <LocationCard key={loc.id} location={loc as any} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
