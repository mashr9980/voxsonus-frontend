import { NextResponse } from "next/server";
/**
 * NOTE: This is middleware code for Next.js and should remain in JavaScript (or TypeScript).
 * Middleware files (middleware.js) do not use JSX, as they run on the server and do not render UI.
 * However, here is the code converted to plain JavaScript (no TypeScript types).
 */

// Define route patterns
const PUBLIC_ROUTES = ["/", "/login", "/signup"];

const ADMIN_ROUTES = ["/admin"];
const USER_ROUTES = ["/user"];
const AUTH_ROUTES = ["/login", "/signup"];

// Helper function to get cookies from request
function getCookieValue(request, name) {
  const cookie = request.cookies.get(name);
  return cookie ? cookie.value : null;
}

// Helper function to check if path matches route patterns
function isRouteMatch(pathname, routes) {
  return routes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  });
}

// Helper function to check if route is public
function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  });
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get auth data from cookies
  const token = getCookieValue(request, "auth_token");
  const role = getCookieValue(request, "user_role");
  const userId = getCookieValue(request, "user_id");

  // Check if user is authenticated
  const isAuthenticated = !!(token && role && userId);

  console.log("Middleware:", {
    pathname,
    isAuthenticated,
    role,
    token: token ? "present" : "missing",
  });

  // Handle public routes
  if (isPublicRoute(pathname)) {
    // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (isAuthenticated && isRouteMatch(pathname, AUTH_ROUTES)) {
      const redirectPath =
        role?.toLowerCase() === "admin" ? "/admin/users" : "/user/dashboard";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Allow access to public routes
    return NextResponse.next();
  }

  // Handle authentication requirement for protected routes
  if (!isAuthenticated) {
    // Store the attempted URL for redirect after login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle admin routes
  if (isRouteMatch(pathname, ADMIN_ROUTES)) {
    if (role?.toLowerCase() !== "admin") {
      // Non-admin users trying to access admin routes
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Handle user routes
  if (isRouteMatch(pathname, USER_ROUTES)) {
    if (role?.toLowerCase() !== "user") {
      // Admin users trying to access user routes (redirect to admin dashboard)
      return NextResponse.redirect(new URL("/admin/users", request.url));
    }
    return NextResponse.next();
  }

  // Handle root redirect for authenticated users
  if (pathname === "/" && isAuthenticated) {
    const redirectPath =
      role?.toLowerCase() === "admin" ? "/admin/users" : "/user/dashboard";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Default: allow access
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
