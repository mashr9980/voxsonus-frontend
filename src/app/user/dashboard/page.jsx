"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthCookies, clearAuthCookies, getAuthHeaders } from "@/lib/auth";
import { toast } from "sonner";
import {
  Upload,
  Plus,
  FileVideo,
  Clock,
  DollarSign,
  Eye,
  LogOut,
  Download,
  FileText,
  Trash2,
  Calendar,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Bell,
  BellDot,
  Merge,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { API_BASE_URL } from "@/lib/api";

export default function UserDashboard() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    token: null,
    role: null,
    userId: null,
  });
  const [stats, setStats] = useState({
    total_orders: 0,
    processing_orders: 0,
    completed_orders: 0,
    total_spent: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [subtitleFiles, setSubtitleFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log(notifications, "NOTIFICATIONS");

  // Fetch dashboard overview stats
  const fetchOverviewStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/overview`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch overview stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching overview stats:", error);
      toast.error("Failed to load dashboard stats");
    }
  };

  // Fetch recent orders
  const fetchRecentOrders = async (limit = 5) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/recent-orders?limit=${limit}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch recent orders");
      const data = await response.json();
      setRecentOrders(data);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      toast.error("Failed to load recent orders");
    }
  };

  // Fetch available downloads
  const fetchDownloads = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/downloads`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch downloads");
      const data = await response.json();
      setSubtitleFiles(data);
    } catch (error) {
      console.error("Error fetching downloads:", error);
      toast.error("Failed to load downloads");
    }
  };

  // Fetch notifications
  const fetchNotifications = async (skip = 0, limit = 10) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/?skip=${skip}&limit=${limit}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      // TODO: Implement mark as read API endpoint
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      const authData = getAuthCookies();

      if (!authData.token) {
        toast.error("Access denied", {
          description: "Please log in to continue",
        });
        router.push("/login");
        return;
      }

      setUserInfo(authData);
      setIsLoading(true);

      try {
        // Fetch all dashboard data in parallel
        await Promise.all([
          fetchOverviewStats(),
          fetchRecentOrders(),
          fetchDownloads(),
          fetchNotifications(),
        ]);

        toast.success("Welcome back!", {
          description: "Your dashboard is ready",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error initializing dashboard:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  const handleLogout = () => {
    clearAuthCookies();
    toast.success("Logged out successfully", {
      description: "See you next time!",
      duration: 3000,
    });
    router.push("/");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.is_read);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-3 flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">V</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">
                  Manage your subtitle orders
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    {unreadNotifications.length > 0 ? (
                      <BellDot className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-2 w-2 flex items-center justify-center"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4 text-center">
                        No notifications
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {notifications.slice(0, 20).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border text-sm ${
                              notification.is_read
                                ? "bg-slate-50 border-slate-200"
                                : "bg-blue-50 border-blue-200"
                            }`}
                            onClick={() =>
                              !notification.is_read &&
                              markNotificationAsRead(notification.id)
                            }
                          >
                            <p className="font-medium">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Order #{notification.order_id} •{" "}
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-slate-600 text-lg">
            Manage your video subtitle orders and track your progress.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileVideo className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_orders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.processing_orders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed_orders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.total_spent.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Link
            href="/user/upload"
            className="group bg-gradient-to-r from-primary to-purple-700 rounded-lg p-6 text-white hover:from-purple-700 hover:to-primary transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Upload className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">Upload Videos</h3>
                <p className="text-purple-100 mt-1">
                  Upload your videos to get started with subtitle generation
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/user/merge-files"
            className="group bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white hover:from-blue-700 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Merge className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold">Merge Files</h3>
                <p className="text-blue-100 mt-1">
                  Combine multiple subtitle files into one for easier management
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center">
                  <FileVideo className="h-6 w-6 text-blue-600 mr-2" />
                  Recent Orders
                </CardTitle>
                <Link
                  href="/user/orders"
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <FileVideo className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4 text-lg">No orders yet</p>
                  <Link
                    href="/user/upload"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create your first order
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-6 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileVideo className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 truncate max-w-48">
                              {order.video_title}
                            </h4>
                            <div className="flex items-center text-sm text-slate-500 mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(order.date)}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/user/orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getStatusBadge(order.status)}
                          <span className="text-sm text-slate-500">
                            {formatDuration(order.duration)}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900">
                          ${order.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Downloads */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50 rounded-t-lg">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center">
                <Download className="h-6 w-6 text-green-600 mr-2" />
                Available Files
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {subtitleFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4 text-lg">
                    No files available
                  </p>
                  <p className="text-sm text-slate-400">
                    Complete your orders to see downloadable files
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {subtitleFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-6 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {file.subtitle_file_name}
                            </h4>
                            <p className="text-sm text-slate-500">
                              For: {file.video_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            {file.subtitle_file_name
                              .split(".")
                              .pop()
                              ?.toUpperCase() || "FILE"}
                          </Badge>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
