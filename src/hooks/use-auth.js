"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthCookies, getCurrentUser, clearAuthCookies } from "@/lib/auth";

export function useAuth() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    token: null,
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      const { token, role, userId } = getAuthCookies();

      if (!token || !role || !userId) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          token: null,
        });
        return;
      }

      // If we have basic auth data, set as authenticated immediately
      // This prevents flash of unauthenticated state
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        token,
        isLoading: true, // Still loading user data
      }));

      // Try to get current user data
      try {
        const userData = await getCurrentUser(token);
        setAuthState({
          isAuthenticated: true,
          user: userData,
          isLoading: false,
          token,
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Token might be invalid, clear cookies
        clearAuthCookies();
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          token: null,
        });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        token: null,
      });
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthCookies();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      token: null,
    });
  }, []);

  const login = useCallback((userData, token) => {
    setAuthState({
      isAuthenticated: true,
      user: userData,
      isLoading: false,
      token,
    });
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    ...authState,
    logout,
    login,
    refetch: checkAuthStatus,
  };
}
