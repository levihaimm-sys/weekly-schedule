import { redirect } from "next/navigation";

export default function HomePage() {
  // Middleware handles redirection based on auth state
  redirect("/login");
}
