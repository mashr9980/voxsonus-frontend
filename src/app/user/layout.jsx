import { AuthGuard } from "@/components/auth-guard";
import React from "react";

export default function UserLayout({ children }) {
  return <AuthGuard requiredRole="user">{children}</AuthGuard>;
}
