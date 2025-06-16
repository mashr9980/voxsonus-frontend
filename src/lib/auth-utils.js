import { getAuthCookies } from "./auth";

// Client-side auth check hook
export function useAuthCheck() {
  const authData = getAuthCookies();

  return {
    isAuthenticated: !!(authData.token && authData.role && authData.userId),
    user: authData,
    isAdmin: authData.role?.toLowerCase() === "admin",
    isUser: authData.role?.toLowerCase() === "user",
  };
}

// Server-side auth check for API routes
export function validateAuthToken(token) {
  if (!token) return false;

  try {
    // Add your token validation logic here
    // For now, just check if token exists
    return token.length > 0;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

// Role-based access control
export function hasPermission(userRole, requiredRole) {
  if (!userRole) return false;

  const role = userRole.toLowerCase();

  // Admin has access to everything
  if (role === "admin") return true;

  // User only has access to user routes
  if (role === "user" && requiredRole === "user") return true;

  return false;
}

// Get redirect path based on role
export function getRedirectPath(role) {
  switch (role?.toLowerCase()) {
    case "admin":
      return "/admin/users";
    case "user":
      return "/user/dashboard";
    default:
      return "/login";
  }
}
