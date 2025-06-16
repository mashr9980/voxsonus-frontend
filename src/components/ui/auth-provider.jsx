"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  getRedirectPath,
  getAuthCookies,
  clearAuthCookies,
} from "@/lib/auth";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in using cookies
    const { token } = getAuthCookies();
    if (token) {
      getCurrentUser(token)
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // If token is invalid, clear cookies
          clearAuthCookies();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (token, role, userId) => {
    // Cookies are already set by the auth functions
    // Fetch user data
    getCurrentUser(token)
      .then((userData) => {
        setUser(userData);
        const redirectPath = getRedirectPath(role);
        router.push(redirectPath);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };

  const logout = () => {
    clearAuthCookies();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
