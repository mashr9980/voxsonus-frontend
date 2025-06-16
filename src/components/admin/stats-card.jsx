"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { StatsCards } from "@/components/admin/stats-cards";
import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/admin-api";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [ordersByStatus, setOrdersByStatus] = useState(null);

  useEffect(() => {
    fetchOrdersByStatus();
  }, []);

  const fetchOrdersByStatus = async () => {
    try {
      const stats = await getAdminStats();
      setOrdersByStatus(stats.orders_by_status);
    } catch (error) {
      toast.error("Failed to load order statistics");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-purple-100 text-purple-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "created":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome to your admin dashboard. Here's what's happening with your
              platform today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <StatsCards />
          </div>

          {/* Orders by Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Orders by Status
                </h3>
                {ordersByStatus ? (
                  <div className="space-y-3">
                    {Object.entries(ordersByStatus).map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              status
                            )}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() =>
                      toast.info("Redirecting to user management...")
                    }
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      Manage Users
                    </div>
                    <div className="text-sm text-gray-500">
                      View and edit user accounts
                    </div>
                  </button>
                  <button
                    onClick={() => toast.info("Redirecting to settings...")}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      System Settings
                    </div>
                    <div className="text-sm text-gray-500">
                      Configure platform settings
                    </div>
                  </button>
                  <button
                    onClick={() => toast.info("Generating reports...")}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      Generate Reports
                    </div>
                    <div className="text-sm text-gray-500">
                      Create detailed analytics reports
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
