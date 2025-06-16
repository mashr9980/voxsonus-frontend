"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Shield,
  LogOut,
  ArrowRight,
  Play,
} from "lucide-react";

export function AuthButtons({ variant = "header", className = "" }) {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const router = useRouter();

  const authKey = `${isAuthenticated}-${user?.id || "none"}`;
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully", {
      description: "See you next time!",
      duration: 3000,
    });
    window.location.href = "/";
  };

  const getUserName = (user) => {
    if (!user) return "User";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    return `${firstName} ${lastName}`.trim() || user.email || "User";
  };

  const getDashboardPath = (role) => {
    return role === "admin" ? "/admin/users" : "/user/dashboard";
  };

  // Show loading state only for a brief moment
  if (isLoading && !isAuthenticated) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (variant === "hero") {
    if (!isAuthenticated) {
      return (
        <div
          key={authKey}
          className={`flex flex-col sm:flex-row gap-4 justify-center ${className}`}
        >
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-purple-700 transition-colors"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 border border-purple-300 text-base font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 transition-colors"
          >
            <Play className="mr-2 h-5 w-5" />
            Login to Your Account
          </Link>
        </div>
      );
    }

    return (
      <div
        key={authKey}
        className={`flex flex-col sm:flex-row gap-4 justify-center ${className}`}
      >
        {user?.role === "user" && (
          <Link
            href={getDashboardPath(user?.role || "user")}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-purple-700 transition-colors"
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Link>
        )}
        {user?.role === "admin" && (
          <Link
            href="/admin/users"
            className="inline-flex items-center px-8 py-3 border border-purple-300 text-base font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 transition-colors"
          >
            <Shield className="mr-2 h-5 w-5" />
            Admin Panel
          </Link>
        )}
      </div>
    );
  }

  // Header variant
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center space-x-3 ${className}`} key={authKey}>
        <Link
          href="/login"
          className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="bg-primary hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`} key={authKey}>
      {/* Dashboard Button */}
      {user?.role === "user" && (
        <Link
          href={getDashboardPath(user?.role || "user")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-purple-700 transition-colors"
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </Link>
      )}

      {/* Admin Panel Button (only for admins) */}
      {user?.role === "admin" && (
        <Link
          href="/admin/users"
          className="inline-flex items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 transition-colors"
        >
          <Shield className="h-4 w-4 mr-2" />
          Admin Panel
        </Link>
      )}

      <Button
        variant="outline"
        onClick={handleLogout}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
