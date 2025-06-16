import { cookies } from "next/headers";

// Server-side authentication utilities
export async function getServerAuthData() {
  const cookieStore = await cookies();

  return {
    token: cookieStore.get("auth_token")?.value || null,
    role: cookieStore.get("user_role")?.value || null,
    userId: cookieStore.get("user_id")?.value || null,
  };
}

export async function isAuthenticated() {
  const { token } = await getServerAuthData();
  return !!token;
}

export async function isAdmin() {
  const { role } = await getServerAuthData();
  return role === "admin";
}

export async function requireAuth() {
  const authData = await getServerAuthData();
  if (!authData.token) {
    throw new Error("Authentication required");
  }
  return authData;
}

export async function requireAdmin() {
  const authData = await requireAuth();
  if (authData.role !== "admin") {
    throw new Error("Admin access required");
  }
  return authData;
}
