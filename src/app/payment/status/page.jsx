"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Download,
  Eye,
  Info,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";

export default function PaymentStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || null;

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentStatus = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      if (!orderId) {
        throw new Error("Order ID is required");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/payments/status/${orderId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch payment status: ${response.status}`);
      }

      const result = await response.json();

      // Map API response to component data structure
      const mappedData = {
        orderId: result.order_id?.toString(),
        orderStatus: result.order_status,
        paymentStatus: result.payment_status,
        stripeStatus: result.stripe_status,
        stripeSessionStatus: result.stripe_session_status,
        amount: result.total_amount,
        currency: "USD", // Default currency, you might want to get this from API
        createdAt: result.last_updated, // Using last_updated as created date
        updatedAt: result.last_updated,
        progressPercentage: getProgressPercentage(
          result.order_status,
          result.payment_status
        ),
      };

      setPaymentStatus(mappedData);
      setIsLoading(false);
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error fetching payment status:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load payment status"
      );
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getProgressPercentage = (orderStatus, paymentStatus) => {
    if (orderStatus === "completed" && paymentStatus === "paid") return 100;
    if (orderStatus === "processing" || paymentStatus === "processing")
      return 65;
    if (orderStatus === "pending" || paymentStatus === "pending") return 25;
    if (orderStatus === "failed" || paymentStatus === "failed") return 0;
    return 50;
  };

  useEffect(() => {
    fetchPaymentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDisplayStatus = () => {
    if (!paymentStatus) return "pending";

    // Determine display status based on order_status and payment_status
    if (
      paymentStatus.orderStatus === "completed" &&
      paymentStatus.paymentStatus === "paid"
    ) {
      return "completed";
    }
    if (
      paymentStatus.orderStatus === "failed" ||
      paymentStatus.paymentStatus === "failed"
    ) {
      return "failed";
    }
    if (
      paymentStatus.orderStatus === "processing" ||
      paymentStatus.paymentStatus === "processing"
    ) {
      return "processing";
    }
    return "pending";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-8 w-8 text-red-600" />;
      case "processing":
        return <Clock className="h-8 w-8 text-blue-600 animate-pulse" />;
      case "pending":
        return <AlertTriangle className="h-8 w-8 text-yellow-600" />;
      default:
        return <Clock className="h-8 w-8 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "from-green-600 to-emerald-600";
      case "processing":
        return "from-blue-600 to-purple-600";
      case "pending":
        return "from-yellow-500 to-orange-500";
      case "failed":
      case "cancelled":
        return "from-red-600 to-pink-600";
      default:
        return "from-slate-600 to-slate-700";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Checking payment status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 pt-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Error Loading Status
            </h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={fetchPaymentStatus}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/user/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayStatus = getDisplayStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={fetchPaymentStatus}
            disabled={isRefreshing}
            className="flex items-center"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Status Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            {getStatusIcon(displayStatus)}
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Payment Status
          </h1>
          <div className="flex items-center justify-center space-x-4">
            {getStatusBadge(displayStatus)}
            <span className="text-slate-500">•</span>
            <span className="text-slate-600">
              Order #{paymentStatus?.orderId}
            </span>
          </div>
        </div>

        {/* API Status Info */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Order Status:</strong> {paymentStatus?.orderStatus} •{" "}
            <strong>Payment Status:</strong> {paymentStatus?.paymentStatus} •{" "}
            <strong>Stripe Status:</strong> {paymentStatus?.stripeStatus}
          </AlertDescription>
        </Alert>

        {/* Progress Bar */}
        {displayStatus === "processing" && (
          <Card className="mb-8 shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">
                  Processing Progress
                </span>
                <span className="text-sm text-slate-500">
                  {paymentStatus?.progressPercentage}%
                </span>
              </div>
              <Progress
                value={paymentStatus?.progressPercentage}
                className="h-3"
              />
              <p className="text-sm text-slate-600 mt-2">
                Your payment is being processed. This usually takes a few
                minutes.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Details */}
          <Card className="shadow-xl border-0 pt-0">
            <CardHeader
              className={`bg-gradient-to-r ${getStatusColor(
                displayStatus
              )} text-white rounded-t-lg py-2`}
            >
              <CardTitle className="flex items-center text-xl">
                <CreditCard className="h-6 w-6 mr-2" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Order ID</span>
                <span className="font-bold text-slate-900">
                  #{paymentStatus?.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Amount</span>
                <span className="font-bold text-2xl text-slate-900">
                  ${paymentStatus?.amount?.toFixed(2)} {paymentStatus?.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Payment Status</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {paymentStatus?.paymentStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Order Status</span>
                <Badge className="bg-purple-100 text-purple-800">
                  {paymentStatus?.orderStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Stripe Status</span>
                <Badge className="bg-green-100 text-green-800">
                  {paymentStatus?.stripeStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Last Updated</span>
                <span className="text-slate-900">
                  {formatDate(paymentStatus?.updatedAt || "")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card className="shadow-xl border-0 pt-0">
            <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg py-2">
              <CardTitle className="flex items-center text-xl">
                <Eye className="h-6 w-6 mr-2" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-slate-600 text-sm">Service</label>
                <p className="font-semibold text-slate-900 mt-1">
                  Subtitle Generation Service
                </p>
              </div>
              <div>
                <label className="text-slate-600 text-sm">
                  Processing Status
                </label>
                <div className="flex items-center mt-2">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${
                      displayStatus === "completed"
                        ? "bg-green-500 animate-pulse"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <span className="text-slate-900 font-medium">
                    {displayStatus === "completed"
                      ? "Ready to Process"
                      : "Awaiting Confirmation"}
                  </span>
                </div>
              </div>

              {/* Status-specific content */}
              {displayStatus === "completed" && (
                <div className="bg-green-50 rounded-lg p-4 mt-4">
                  <p className="text-green-800 text-sm mb-3">
                    <strong>Great news!</strong> Your payment was successful and
                    your order is complete.
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Subtitles
                  </Button>
                </div>
              )}

              {displayStatus === "failed" && (
                <div className="bg-red-50 rounded-lg p-4 mt-4">
                  <p className="text-red-800 text-sm mb-3">
                    <strong>Payment failed.</strong> You can try again or
                    contact support for assistance.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Payment
                  </Button>
                </div>
              )}

              {displayStatus === "processing" && (
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Processing in progress.</strong> Your payment is
                    being verified and your order will be ready soon.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-slate-300 px-8 py-3"
          >
            <Link href="/user/dashboard">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            <Link href={`/user/orders/${paymentStatus?.orderId}`}>
              <Eye className="h-5 w-5 mr-2" />
              View Full Order
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
