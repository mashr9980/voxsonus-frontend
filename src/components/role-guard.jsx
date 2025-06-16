"use client";

import React from "react";

import { useAuthCheck } from "@/lib/auth-utils";

export function RoleGuard({ children, allowedRoles, fallback }) {
  const { isAuthenticated, user } = useAuthCheck();

  if (!isAuthenticated) {
    return fallback || null;
  }

  const userRole = user.role?.toLowerCase();
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}
