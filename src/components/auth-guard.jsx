"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthCookies } from "@/lib/auth";
import { toast } from "sonner";

export function AuthGuard({ children, requiredRole, fallback }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authData = getAuthCookies();
      const isAuthenticated = !!(
        authData.token &&
        authData.role &&
        authData.userId
      );

      if (!isAuthenticated) {
        toast.error("Access denied", {
          description: "Please log in to continue",
        });
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check role-based access
      if (requiredRole) {
        const userRole = authData.role?.toLowerCase();

        if (requiredRole === "admin" && userRole !== "admin") {
          toast.error("Access denied", {
            description: "Admin access required",
          });
          router.push("/user/dashboard");
          return;
        }

        if (requiredRole === "user" && userRole !== "user") {
          toast.error("Access denied", {
            description: "User access required",
          });
          router.push("/admin/users");
          return;
        }
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [router, pathname, requiredRole]);

  if (isChecking) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      )
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
