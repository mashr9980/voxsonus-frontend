"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { useEffect, useState } from "react";
import { getSettings, updateSetting } from "@/lib/admin-api";
import { toast } from "sonner";
import { Edit, X, Check } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSetting, setEditingSetting] = useState(null);
  const [editForm, setEditForm] = useState({ value: "", description: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      console.log("Fetched settings:", data);
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting) => {
    setEditingSetting(setting.key);
    setEditForm({
      value: setting.value,
      description: setting.description,
    });
  };

  const handleSave = async (key) => {
    try {
      const loadingToast = toast.loading("Updating setting...");

      await updateSetting(key, editForm.value, editForm.description);

      toast.dismiss(loadingToast);
      toast.success("Setting updated successfully", {
        description: `${key} has been updated`,
      });

      // Refresh settings
      fetchSettings();
      setEditingSetting(null);
    } catch (error) {
      toast.error("Failed to update setting", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleCancel = () => {
    setEditingSetting(null);
    setEditForm({ value: "", description: "" });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatValue = (key, value) => {
    switch (key) {
      case "max_file_size":
        const bytes = Number.parseInt(value);
        if (bytes >= 1073741824) {
          return `${(bytes / 1073741824).toFixed(1)} GB`;
        } else if (bytes >= 1048576) {
          return `${(bytes / 1048576).toFixed(1)} MB`;
        } else if (bytes >= 1024) {
          return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${bytes} bytes`;
      case "price_per_minute":
        return `$${value}`;
      default:
        return value;
    }
  };

  const getInputType = (key) => {
    switch (key) {
      case "max_file_size":
      case "max_files_per_order":
      case "price_per_minute":
        return "number";
      default:
        return "text";
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
              System Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure platform settings and parameters
            </p>
          </div>

          {/* Settings List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border-b border-gray-200 pb-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {settings.map(
                  (setting) =>
                    setting.key !== "max_files_per_order" && (
                      <div key={setting.key} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {setting.key
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </h3>
                              {editingSetting !== setting.key && (
                                <button
                                  onClick={() => handleEdit(setting)}
                                  className="ml-2 text-gray-400 hover:text-gray-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            {editingSetting === setting.key ? (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Value
                                  </label>
                                  <input
                                    type={getInputType(setting.key)}
                                    value={editForm.value}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        value: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                  </label>
                                  <textarea
                                    value={editForm.description}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        description: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleSave(setting.key)}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-purple-700"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancel}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                  {formatValue(setting.key, setting.value)}
                                </div>
                                <p className="text-sm text-gray-500 mb-2">
                                  {setting.description}
                                </p>
                                <div className="text-xs text-gray-400">
                                  Last updated: {formatDate(setting.updated_at)}
                                  {setting.updated_by &&
                                    ` by ${setting.updated_by}`}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                )}
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Settings Help
            </h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>
                <strong>Max File Size:</strong> Controls the maximum size of
                files that can be uploaded to the platform.
              </p>
              <p>
                <strong>Max Files Per Order:</strong> Limits the number of files
                that can be included in a single order.
              </p>
              <p>
                <strong>Price Per Minute:</strong> Sets the base pricing rate
                for services charged by time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
