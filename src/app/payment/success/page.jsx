"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  FileText,
  CreditCard,
  Home,
  Eye,
  Clock,
  AlertTriangle,
  RefreshCw,
  Info,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get session_id and order_id from URL params
        const sessionId = searchParams.get("session_id");
        const orderId = searchParams.get("order_id");

        if (!sessionId || !orderId) {
          setError(
            "Missing payment information in URL. Please check your payment link."
          );
          setIsLoading(false);
          return;
        }

        // Call the API endpoint
        const response = await fetch(
          `${API_BASE_URL}/api/payments/success?session_id=${sessionId}&order_id=${orderId}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to verify payment: ${response.status} ${response.statusText}`
          );
        }

        const result = await response.json();

        // Create payment details from API response
        setPaymentDetails({
          orderId: orderId,
          sessionId: sessionId,
          status: result.status,
          message: result.message,
          success: result.success,
          createdAt: new Date().toISOString(),
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching payment details:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load payment details. Please try again."
        );
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [searchParams]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "pending":
        return <Clock className="h-3 w-3 mr-1" />;
      case "failed":
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      default:
        return <Info className="h-3 w-3 mr-1" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div
              className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-purple-400 animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <p className="text-slate-600 text-lg font-medium">
            Verifying your payment...
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Please wait while we confirm your transaction
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Payment Verification Failed
            </h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/user/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuccess =
    paymentDetails?.success && paymentDetails?.status === "completed";

  return (
    <div
      className={`min-h-screen ${
        isSuccess
          ? "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
          : "bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
              isSuccess ? "bg-green-600" : "bg-yellow-600"
            }`}
          >
            {isSuccess ? (
              <CheckCircle className="h-12 w-12 text-white" />
            ) : (
              <Clock className="h-12 w-12 text-white" />
            )}
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {isSuccess ? "Payment Successful!" : "Payment Status"}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {paymentDetails?.message || "Processing your payment information"}
          </p>
        </div>

        {/* Status Alert */}
        {paymentDetails?.message && (
          <Alert
            className={`mb-8 border-2 ${
              isSuccess
                ? "border-green-200 bg-green-50"
                : "border-yellow-200 bg-yellow-50"
            }`}
          >
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              {paymentDetails.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Information */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader
              className={`text-white py-4 ${
                isSuccess
                  ? "bg-gradient-to-r from-green-600 to-emerald-600"
                  : "bg-gradient-to-r from-yellow-600 to-orange-600"
              }`}
            >
              <CardTitle className="flex items-center text-xl">
                <CreditCard className="h-6 w-6 mr-2" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Order ID</span>
                <span className="font-bold text-slate-900 text-lg">
                  #{paymentDetails?.orderId}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Session ID</span>
                <span className="font-mono text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  {paymentDetails?.sessionId?.slice(-12)}...
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Status</span>
                <Badge
                  className={`${getStatusColor(
                    paymentDetails?.status || ""
                  )} border`}
                >
                  {getStatusIcon(paymentDetails?.status || "")}
                  {paymentDetails?.status?.charAt(0).toUpperCase() +
                    paymentDetails?.status?.slice(1)}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-slate-600 font-medium">Date</span>
                <span className="text-slate-900 font-medium">
                  {formatDate(paymentDetails?.createdAt || "")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4">
              <CardTitle className="flex items-center text-xl">
                <FileText className="h-6 w-6 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="text-slate-600 text-sm font-medium">
                  Service
                </label>
                <p className="font-semibold text-slate-900 mt-1 text-lg">
                  Subtitle Generation Service
                </p>
              </div>

              <div>
                <label className="text-slate-600 text-sm font-medium">
                  Processing Status
                </label>
                <div className="flex items-center mt-2">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${
                      isSuccess ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                    }`}
                  ></div>
                  <span className="text-slate-900 font-medium">
                    {isSuccess ? "Ready to Process" : "Awaiting Confirmation"}
                  </span>
                </div>
              </div>

              {isSuccess && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 text-sm font-medium mb-1">
                        What's next?
                      </p>
                      <p className="text-blue-700 text-sm">
                        Your payment has been confirmed. We'll start processing
                        your order immediately and notify you once it's ready.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {isSuccess && (
            <Button
              asChild
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 shadow-lg"
            >
              <Link href={`/user/orders/${paymentDetails?.orderId}`}>
                <Eye className="h-5 w-5 mr-2" />
                View Order Details
              </Link>
            </Button>
          )}

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-slate-300 px-8 py-3 shadow-lg bg-white hover:bg-slate-50"
          >
            <Link href="/user/dashboard">
              <Home className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Process Steps - Only show if payment is successful */}
        {isSuccess && (
          <Card className="mt-8 shadow-lg border-0 overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                What happens next?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-3 text-lg">
                    Processing
                  </h4>
                  <p className="text-slate-600">
                    Our AI system analyzes your content and generates accurate
                    subtitles with perfect timing
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-3 text-lg">
                    Quality Check
                  </h4>
                  <p className="text-slate-600">
                    We review and optimize the subtitles for accuracy,
                    readability, and synchronization
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-3 text-lg">
                    Ready
                  </h4>
                  <p className="text-slate-600">
                    Download your subtitle files in multiple formats including
                    SRT, VTT, and more
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
