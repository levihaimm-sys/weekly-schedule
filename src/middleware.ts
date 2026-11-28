import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LOGIN_NEXT_COOKIE = "login_next"; // keep in sync with lib/actions/auth.ts
const BOT_SPACE_COOKIE = "bot_space"; // keep in sync with bot/lib/nav.ts
const PUBLIC_ROUTES = ["/login", "/instructor-login", "/auth/callback", "/client-portal"];
const ADMIN_ROUTES = ["/dashboard", "/schedule", "/instructors", "/locations", "/reports", "/settings", "/tasks"];
const INSTRUCTOR_ROUTES = ["/today", "/my-schedule", "/confirm-lessons", "/sign", "/profile"];

export async function middleware(request: NextRequest) {
  // WhatsApp bot: /bot?space=personal|business picks the world in the same
  // request (no extra redirect). The page itself still checks it is allowed.
  const botSpace = request.nextUrl.pathname.startsWith("/bot")
    ? request.nextUrl.searchParams.get("space")
    : null;
  const isPrefetch = request.headers.has("next-router-prefetch") || request.headers.get("purpose") === "prefetch";
  const switchBotSpace = !isPrefetch && (botSpace === "personal" || botSpace === "business");
  if (switchBotSpace) request.cookies.set(BOT_SPACE_COOKIE, botSpace);

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

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Instructors (or a device that remembers an instructor) go to the
    // instructor login, which signs them back in automatically
    const isInstructorEntry =
      request.cookies.has("remember_instructor") ||
      (!request.cookies.has("admin_device") &&
        (pathname === "/" || INSTRUCTOR_ROUTES.some((route) => pathname.startsWith(route))));
    const loginRedirect = NextResponse.redirect(
      new URL(isInstructorEntry ? "/instructor-login" : "/login", request.url)
    );
    // Remember where an admin was going (e.g. a saved /bot link on the phone),
    // so the login lands there instead of the dashboard.
    if (!isInstructorEntry && pathname !== "/") {
      loginRedirect.cookies.set(LOGIN_NEXT_COOKIE, pathname + request.nextUrl.search, {
        maxAge: 60 * 15,
        path: "/",
        sameSite: "lax",
        httpOnly: true,
      });
    }
    return loginRedirect;
  }

  if (pathname === "/") {
    // Device signed in through the instructor login → instructor app; otherwise admin
    const home = request.cookies.has("remember_instructor") ? "/today" : "/dashboard";
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (switchBotSpace) {
    // Readable by the sidebar so it can mark the current world.
    supabaseResponse.cookies.set(BOT_SPACE_COOKIE, botSpace, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|offline.html|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
