"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSpace, isSpace, SPACE_COOKIE } from "@/bot/lib/space";

// Switch between the personal and business worlds. Lands on the world's home
// page, since each world has its own menu.
export async function setSpace(formData: FormData) {
  const next = formData.get("space");
  const { allowed } = await getSpace();
  if (isSpace(next) && allowed.includes(next)) {
    (await cookies()).set(SPACE_COOKIE, next, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true });
  }
  redirect("/bot");
}
