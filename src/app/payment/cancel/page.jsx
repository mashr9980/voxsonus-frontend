"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XCircle,
  RefreshCw,
  Home,
  HelpCircle,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";

export default function PaymentCancel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCancelDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get order_id from URL params
        const orderId = searchParams.get("order_id");

        if (!orderId) {
          setError("Missing order ID in URL parameters");
          setIsLoading(false);
          return;
        }

        // Call the cancel API endpoint
        const response = await fetch(
          `${API_BASE_URL}/api/payments/cancel?order_id=${orderId}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch cancel details: ${response.status}`);
        }

        const result = await response.json();

        setOrderDetails({
          orderId: result.order_id.toString(),
          message: result.message,
          status: result.status,
          success: result.success,
          timestamp: new Date().toISOString(),
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching cancel details:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load cancellation details"
        );
        setIsLoading(false);
      }
    };

    fetchCancelDetails();
  }, [searchParams]);

  const handleRetryPayment = () => {
    if (orderDetails?.orderId) {
      router.push(`/user/orders`);
    } else {
      router.push("/user/dashboard");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Error Loading Details
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cancel Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <XCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {orderDetails?.message ||
              "Your payment was not completed. No charges were made to your account."}
          </p>
        </div>

        {orderDetails?.message && (
          <Alert className="mb-8 border-2 border-red-200 bg-red-50 max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium text-red-800">
              {orderDetails.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card className="shadow-xl border-0 pt-0">
            <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-lg py-2">
              <CardTitle className="flex items-center text-xl">
                <AlertTriangle className="h-6 w-6 mr-2" />
                Cancelled Order
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Order ID</span>
                <span className="font-semibold text-slate-900">
                  #{orderDetails?.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Service</span>
                <span className="text-slate-900">Subtitle Generation</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Status</span>
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <XCircle className="h-3 w-3 mr-1" />
                  {orderDetails?.status?.charAt(0).toUpperCase() +
                    orderDetails?.status?.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Cancelled At</span>
                <span className="text-slate-900">
                  {formatDate(orderDetails?.timestamp || "")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* What Happened */}
          <Card className="shadow-xl border-0 pt-0">
            <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg py-2">
              <CardTitle className="flex items-center text-xl">
                <HelpCircle className="h-6 w-6 mr-2" />
                What Happened?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800">
                    <strong>Status:</strong> {orderDetails?.message}
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900">
                    Common reasons for payment cancellation:
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Payment was manually cancelled by the user
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Browser was closed during payment process
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Payment session expired
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Network connectivity issues
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRetryPayment}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Retry Payment
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-slate-300 px-8 py-3"
          >
            <Link href="/user/dashboard">
              <Home className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Help Section */}
        <Card className="mt-8 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Need Help?
              </h3>
              <p className="text-slate-600 mb-6">
                If you're experiencing issues with payment, our support team is
                here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href="/support">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/faq">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment FAQ
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Preservation Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Your order is saved
              </h4>
              <p className="text-blue-800 text-sm">
                Don't worry! Your order details and uploaded video are safely
                stored. You can complete the payment anytime from your
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
