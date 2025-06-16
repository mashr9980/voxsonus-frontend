import { API_BASE_URL } from "./api";

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: false, // Set to true for server-side only cookies
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

// Helper functions for cookie management
export function setAuthCookies(authData) {
  if (typeof window !== "undefined") {
    // Client-side cookie setting
    document.cookie = `auth_token=${authData.access_token}; max-age=${
      COOKIE_OPTIONS.maxAge
    }; path=${COOKIE_OPTIONS.path}; ${
      COOKIE_OPTIONS.secure ? "secure;" : ""
    } samesite=${COOKIE_OPTIONS.sameSite}`;
    document.cookie = `user_role=${authData.role}; max-age=${
      COOKIE_OPTIONS.maxAge
    }; path=${COOKIE_OPTIONS.path}; ${
      COOKIE_OPTIONS.secure ? "secure;" : ""
    } samesite=${COOKIE_OPTIONS.sameSite}`;
    document.cookie = `user_id=${authData.user_id}; max-age=${
      COOKIE_OPTIONS.maxAge
    }; path=${COOKIE_OPTIONS.path}; ${
      COOKIE_OPTIONS.secure ? "secure;" : ""
    } samesite=${COOKIE_OPTIONS.sameSite}`;
  }
}

export function getAuthCookies() {
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {});

    return {
      token: cookies.auth_token || null,
      role: cookies.user_role || null,
      userId: cookies.user_id || null,
    };
  }
  return { token: null, role: null, userId: null };
}

export function clearAuthCookies() {
  if (typeof window !== "undefined") {
    document.cookie = `auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${COOKIE_OPTIONS.path};`;
    document.cookie = `user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${COOKIE_OPTIONS.path};`;
    document.cookie = `user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${COOKIE_OPTIONS.path};`;
  }
}

// Helper function to get redirect path based on role
export function getRedirectPath(role) {
  switch (role.toLowerCase()) {
    case "admin":
      return "/admin/users";
    case "user":
    default:
      return "/user/dashboard";
  }
}

// Register a new user
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || "Registration failed";
    throw new Error(errorMessage);
  }

  const authData = await response.json();
  setAuthCookies(authData);
  return authData;
}

// Login user
export async function loginUser(username, password) {
  // Create form data for FastAPI login endpoint
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || "Login failed";
    throw new Error(errorMessage);
  }

  const authData = await response.json();
  setAuthCookies(authData);
  return authData;
}

// Get current user
export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return response.json();
}

export function getAuthHeaders() {
  const { token } = getAuthCookies();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    // Add ngrok bypass header
    // "ngrok-skip-browser-warning": "true",
    // Add additional headers for CORS
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// Logout user
export function logoutUser() {
  clearAuthCookies();
}
