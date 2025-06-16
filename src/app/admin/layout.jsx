import { RoleGuard } from "@/components/role-guard";
import React from "react";

export default function UserLayout({ children }) {
  return <RoleGuard allowedRoles={["admin"]}>{children}</RoleGuard>;
}
