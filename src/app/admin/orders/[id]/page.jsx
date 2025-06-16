"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { useEffect, useState } from "react";
import {
  getOrder,
  updateOrder,
  reprocessOrder,
  refundOrder,
  downloadSubtitleQA,
  updateSubtitleQAStatus,
} from "@/lib/admin-api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  RefreshCw,
  DollarSign,
  Download,
  FileText,
  AlertTriangle,
  Check,
  X,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderDetails() {
  const params = useParams();
  const orderId = Number(params.id);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reprocessNotes, setReprocessNotes] = useState("");
  const [showReprocessDialog, setShowReprocessDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundNotes, setRefundNotes] = useState("");
  const [qaDialogOpen, setQaDialogOpen] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState(null);
  const [qaStatus, setQaStatus] = useState("approved");
  const [qaNotes, setQaNotes] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (error) {
      toast.error("Failed to load order details", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!order) return;

    try {
      const loadingToast = toast.loading("Updating order status...");

      await updateOrder(order.id, { status: newStatus });

      toast.dismiss(loadingToast);
      toast.success("Order status updated successfully");

      fetchOrder();
    } catch (error) {
      toast.error("Failed to update order status", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus) => {
    if (!order) return;

    try {
      const loadingToast = toast.loading("Updating payment status...");

      await updateOrder(order.id, { payment_status: newPaymentStatus });

      toast.dismiss(loadingToast);
      toast.success("Payment status updated successfully");

      fetchOrder();
    } catch (error) {
      toast.error("Failed to update payment status", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleReprocess = async () => {
    if (!order) return;

    try {
      const loadingToast = toast.loading("Reprocessing order...");

      await reprocessOrder(order.id, reprocessNotes);

      toast.dismiss(loadingToast);
      toast.success("Order reprocessing initiated");

      setShowReprocessDialog(false);
      setReprocessNotes("");
      fetchOrder();
    } catch (error) {
      toast.error("Failed to reprocess order", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleRefund = async () => {
    if (!order) return;

    if (!refundNotes.trim()) {
      toast.error("Refund notes are required", {
        description: "Please provide a reason for the refund",
      });
      return;
    }

    try {
      const loadingToast = toast.loading("Processing refund...");

      await refundOrder(order.id, refundNotes);

      toast.dismiss(loadingToast);
      toast.success("Refund processed successfully");

      setShowRefundDialog(false);
      setRefundNotes("");
      fetchOrder();
    } catch (error) {
      toast.error("Failed to process refund", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleDownloadSubtitle = async (subtitleId, filename) => {
    try {
      const loadingToast = toast.loading("Downloading subtitle...");

      const content = await downloadSubtitleQA(subtitleId);

      console.log(content, "SUBTITLE CONTENT");

      // Create blob and download
      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss(loadingToast);
      toast.success("Subtitle downloaded successfully");
    } catch (error) {
      toast.error("Failed to download subtitle", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleQAStatusUpdate = async () => {
    if (!selectedSubtitle) return;

    try {
      const loadingToast = toast.loading("Updating QA status...");

      await updateSubtitleQAStatus(selectedSubtitle.id, qaStatus, qaNotes);

      toast.dismiss(loadingToast);
      toast.success(`Subtitle ${qaStatus} successfully`);

      setQaDialogOpen(false);
      setSelectedSubtitle(null);
      setQaNotes("");
      fetchOrder();
    } catch (error) {
      toast.error("Failed to update QA status", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const openQADialog = (subtitle) => {
    setSelectedSubtitle(subtitle);
    setQaStatus("approved");
    setQaNotes("");
    setQaDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-purple-100 text-purple-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "canceled":
        return "bg-gray-100 text-gray-800";
      case "created":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-orange-100 text-orange-800";
      case "unpaid":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQAStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getUserName = (user) => {
    if (!user) return "Unknown User";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    return `${firstName} ${lastName}`.trim() || user.email || "Unknown User";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log(order, "ORDERS");

  if (!order) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Order not found</p>
            <Link
              href="/admin/orders"
              className="text-primary hover:underline mt-2 inline-block"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link
                href="/admin/orders"
                className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Orders
              </Link>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order.id}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Created on {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 mt-4 md:mt-0">
                <button
                  onClick={() => setShowReprocessDialog(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reprocess
                </button>
                {order.payment_status === "paid" && (
                  <button
                    onClick={() => setShowRefundDialog(true)}
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Refund
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Order Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Status
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="created">Created</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={order.payment_status}
                      onChange={(e) =>
                        handlePaymentStatusChange(e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Videos */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Videos ({order.videos?.length || 0})
                </h3>
                {order.videos && order.videos.length > 0 ? (
                  <div className="space-y-3">
                    {order.videos.map((video, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {video.filename || `Video ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              Duration: {formatDuration(video.duration || 0)} |
                              Size:{" "}
                              {((video.file_size || 0) / 1024 / 1024).toFixed(
                                2
                              )}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(
                            video.status || "unknown"
                          )}`}
                        >
                          {video.status || "Unknown"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No videos uploaded</p>
                )}
              </div>

              {/* Subtitle Configuration */}
              {order.subtitle_config && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Subtitle Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Source Language:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {order.subtitle_config.source_language}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Target Language:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {order.subtitle_config.target_language}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Max Chars per Line:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {order.subtitle_config.max_chars_per_line}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Lines per Subtitle:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {order.subtitle_config.lines_per_subtitle}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Output Format:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {order.subtitle_config.output_format}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Genre:</span>
                      <span className="ml-2 text-gray-900">
                        {order.subtitle_config.genre}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtitle Files with QA */}
              {order.subtitle_files && order.subtitle_files.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Generated Subtitles & QA ({order.subtitle_files.length})
                  </h3>
                  <div className="space-y-3">
                    {order.subtitle_files.map((file, index) => {
                      // Extract filename from file_path
                      const filename = file.file_path
                        ? file.file_path.split("\\").pop() ||
                          file.file_path.split("/").pop() ||
                          `subtitle_${file.id}`
                        : `subtitle_${file.id}`;
                      const fileExtension = file.file_format || "srt";
                      const displayFilename = filename.includes(".")
                        ? filename
                        : `${filename}.${fileExtension}`;

                      return (
                        <div
                          key={file.id || index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center flex-1">
                            <Download className="h-5 w-5 text-gray-400 mr-3" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {displayFilename}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Format: {file.file_format || "srt"}</span>
                                <span>
                                  Created: {formatDate(file.created_at)}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full ${getQAStatusBadgeColor(
                                    file.qa_status
                                  )}`}
                                >
                                  QA: {file.qa_status || "pending"}
                                </span>
                              </div>
                              {file.qa_notes && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Notes: {file.qa_notes}
                                </p>
                              )}
                              {file.file_path && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Path: {file.file_path}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleDownloadSubtitle(file.id, displayFilename)
                              }
                              className="text-primary hover:text-purple-700 text-sm px-2 py-1 border border-primary rounded"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => openQADialog(file)}
                              className="text-blue-600 hover:text-blue-700 text-sm px-2 py-1 border border-blue-600 rounded"
                            >
                              QA Review
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Customer
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-sm text-gray-900">
                      {getUserName(order.user)}
                    </p>
                  </div>
                  {order.user?.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-900">
                        {order.user.email}
                      </p>
                    </div>
                  )}
                  {order.user?.id && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        User ID
                      </p>
                      <p className="text-sm text-gray-900">#{order.user.id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">
                      Total Duration
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDuration(order.total_duration || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Total Amount</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${(order.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Status</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Payment</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusBadgeColor(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Order Created
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div className="ml-3">
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
            </div>
          </div>
        </div>
      </div>

      {/* QA Review Dialog */}
      {qaDialogOpen && selectedSubtitle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <Eye className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">QA Review</h3>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>File:</strong> {selectedSubtitle.filename}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Language:</strong> {selectedSubtitle.language} |{" "}
                  <strong>Format:</strong> {selectedSubtitle.format}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QA Status
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="approved"
                      checked={qaStatus === "approved"}
                      onChange={(e) => setQaStatus(e.target.value)}
                      className="mr-2"
                    />
                    <Check className="h-4 w-4 text-green-600 mr-1" />
                    Approved
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="rejected"
                      checked={qaStatus === "rejected"}
                      onChange={(e) => setQaStatus(e.target.value)}
                      className="mr-2"
                    />
                    <X className="h-4 w-4 text-red-600 mr-1" />
                    Rejected
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QA Notes (optional)
                </label>
                <textarea
                  value={qaNotes}
                  onChange={(e) => setQaNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="Add notes about the QA review..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleQAStatusUpdate}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Update QA Status
                </button>
                <button
                  onClick={() => {
                    setQaDialogOpen(false);
                    setSelectedSubtitle(null);
                    setQaNotes("");
                  }}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reprocess Dialog */}
      {showReprocessDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <RefreshCw className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  Reprocess Order
                </h3>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reprocess Notes (optional)
                </label>
                <textarea
                  value={reprocessNotes}
                  onChange={(e) => setReprocessNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="Add notes about why this order is being reprocessed..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleReprocess}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Reprocess
                </button>
                <button
                  onClick={() => {
                    setShowReprocessDialog(false);
                    setReprocessNotes("");
                  }}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Dialog */}
      {showRefundDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  Process Refund
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to process a refund for this order? This
                action cannot be undone.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="Please provide a reason for the refund..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleRefund}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  disabled={!refundNotes.trim()}
                >
                  Process Refund
                </button>
                <button
                  onClick={() => {
                    setShowRefundDialog(false);
                    setRefundNotes("");
                  }}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
