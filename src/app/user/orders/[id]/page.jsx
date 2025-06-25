"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  FileVideo,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Globe,
  Type,
  Film,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";

export default function OrderDetails() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  console.log("Order ID:", orderId);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      // Call your external FastAPI endpoint
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const orderData = await response.json();
      console.log("Order Data:", orderData);
      setOrder(orderData);
    } catch (error) {
      console.error("Failed to load order details:", error);
      toast.error("Failed to load order details", {
        description: "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  // New function to handle payment process
  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);

      // Call the payment API endpoint
      const response = await fetch(
        `${API_BASE_URL}/api/payments/create-checkout-session/${orderId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.checkout_url) {
        // Redirect to the checkout URL
        window.location.href = data.checkout_url;
      } else {
        throw new Error("Invalid response from payment service");
      }
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      toast.error("Failed to initiate payment", {
        description: "Please try again or contact support",
      });
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadSubtitle = async (subtitleId, filename) => {
    try {
      // Call your external FastAPI endpoint for subtitle download
      const response = await fetch(
        `${API_BASE_URL}/api/subtitles/${subtitleId}/download`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const res = await response.json();
      console.log("Download response JSON:", res);

      // Assuming res.download_url contains the pre-signed S3 URL
      const downloadUrl = res.download_url;

      // Create an anchor element to trigger the download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || "subtitle.srt"; // Use provided filename or default
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Subtitle downloaded successfully");
    } catch (error) {
      console.error("Failed to download subtitle:", error);
      toast.error("Failed to download subtitle");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "processing":
        return <Clock className="h-6 w-6 text-blue-500" />;
      case "failed":
      case "canceled":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-purple-100 text-purple-800";
      case "failed":
      case "canceled":
        return "bg-red-100 text-red-800";
      case "created":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getFilenameFromPath = (filePath) => {
    return filePath.split(/[/\\]/).pop() || filePath;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <Link
                href="/user/orders"
                className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Orders
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Order Details
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <Link
                href="/user/orders"
                className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Orders
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Order Details
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-gray-500">Order not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link
                href="/user/orders"
                className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Orders
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Order #{order.id}
                </h1>
                <p className="text-sm text-gray-500">
                  Created on {formatDate(order.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Processing Status
                    </p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {order.status}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Payment Status
                    </p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {order.payment_status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Videos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Videos ({order.videos.length})
              </h3>
              <div className="space-y-3">
                {order.videos.map((video, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileVideo className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {video.original_filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          Duration: {formatDuration(video.duration)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtitle Configuration */}
            {order.subtitle_config && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Subtitle Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Content Type:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {order.subtitle_config.content_type?.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Translation:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.subtitle_config.enable_translation
                        ? `Enabled (${order.subtitle_config.target_language?.toUpperCase()})`
                        : "Disabled"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Type className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Max chars per line:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.subtitle_config.max_chars_per_line}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Lines per subtitle:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.subtitle_config.lines_per_subtitle}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Film className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Genres:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.subtitle_config.genres
                        ?.map(
                          (genre) =>
                            genre.charAt(0).toUpperCase() + genre.slice(1)
                        )
                        .join(", ") || "Not specified"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Output Format:
                    </span>
                    <span className="text-sm font-medium text-gray-900 uppercase">
                      {order.subtitle_config.output_format}
                    </span>
                  </div>

                  {order.subtitle_config.accessibility_mode && (
                    <div className="flex items-center space-x-2 md:col-span-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">
                        Accessibility Mode Enabled
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generated Subtitles */}
            {order.subtitle_files && order.subtitle_files.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Generated Subtitles
                </h3>
                <div className="space-y-3">
                  {order.subtitle_files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {getFilenameFromPath(file.file_path)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Format: {file.file_format.toUpperCase()} • Created:{" "}
                            {formatDate(file.created_at)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleDownloadSubtitle(
                            file.id,
                            getFilenameFromPath(file.file_path)
                          )
                        }
                        className="inline-flex items-center px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Duration</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDuration(order.total_duration)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Videos</span>
                  <span className="text-sm font-medium text-gray-900">
                    {order.videos.length}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-lg font-bold text-primary">
                    ${order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order Created
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Last Updated
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {order.status === "created" &&
              order.payment_status === "unpaid" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Actions
                  </h3>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    You will be redirected to our secure payment processor
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
