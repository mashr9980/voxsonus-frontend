"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { LayoutDashboard, Shield, LogOut, User } from "lucide-react";

export function MobileAuthMenu({ onClose }) {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully", {
      description: "See you next time!",
      duration: 3000,
    });
    onClose();
    router.push("/");
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

  // Show loading state only briefly
  if (isLoading && !isAuthenticated) {
    return (
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
        <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
        <Link
          href="/login"
          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
          onClick={onClose}
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
          onClick={onClose}
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
      <div className="px-3 py-2 border-b border-gray-200 mb-2">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <User className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {isLoading ? "Loading..." : getUserName(user)}
          </span>
        </div>
      </div>
      {user?.role === "user" && (
        <Link
          href={getDashboardPath(user?.role || "user")}
          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
          onClick={onClose}
        >
          <LayoutDashboard className="h-5 w-5 mr-3" />
          Dashboard
        </Link>
      )}
      {user?.role === "admin" && (
        <Link
          href="/admin/users"
          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50"
          onClick={onClose}
        >
          <Shield className="h-5 w-5 mr-3" />
          Admin Panel
        </Link>
      )}
      <button
        onClick={handleLogout}
        className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-5 w-5 mr-3" />
        Logout
      </button>
    </div>
  );
}
