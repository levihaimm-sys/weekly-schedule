import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const lessonPlanId = params.id;

  // Get equipment for this lesson plan
  const { data: equipmentData, error } = await supabase
    .from("lesson_plan_equipment")
    .select(
      `
      equipment_id,
      quantity,
      equipment:equipment(id, name)
    `
    )
    .eq("lesson_plan_id", lessonPlanId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const equipment = (equipmentData || []).map((item: any) => ({
    equipment_id: item.equipment_id,
    equipment_name: item.equipment.name,
    quantity: item.quantity,
  }));

  return NextResponse.json({ equipment });
}
