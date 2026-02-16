import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/instructor-login", "/auth/callback"];
const ADMIN_ROUTES = ["/dashboard", "/schedule", "/instructors", "/locations", "/reports", "/settings"];
const INSTRUCTOR_ROUTES = ["/today", "/my-schedule", "/confirm-lessons", "/sign", "/profile"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // Allow public routes without auth check
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return supabaseResponse;
  }

  // Check if user has auth cookies (simple check without API call)
  const authCookies = request.cookies.getAll().filter(cookie => 
    cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
  );

  // No auth cookies -> redirect to login
  if (authCookies.length === 0) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Root path -> redirect to /today (pages will handle role-based redirects)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  // If we have auth cookies, allow the request to proceed
  // The page itself will handle auth state and redirects if needed
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
