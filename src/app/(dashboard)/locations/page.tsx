import { createClient } from "@/lib/supabase/server";
import { MapPin } from "lucide-react";

export default async function LocationsPage() {
  const supabase = await createClient();

  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, city, street, age_group")
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
      <h2 className="text-2xl font-bold">מיקומים</h2>

      {Object.entries(byCity).map(([city, locs]) => (
        <div key={city}>
          <h3 className="mb-3 text-lg font-semibold">{city}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(locs ?? []).map((loc) => (
              <div
                key={loc.id}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-medium">{loc.name}</p>
                    {loc.street && (
                      <p className="text-sm text-muted-foreground">
                        {loc.street}
                      </p>
                    )}
                  </div>
                </div>
                {loc.age_group && (
                  <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-xs">
                    גיל {loc.age_group}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
