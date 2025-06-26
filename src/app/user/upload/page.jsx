"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Upload,
  X,
  FileVideo,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Play,
  Globe,
  Type,
  Accessibility,
  Film,
  FileText,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { getAuthHeaders } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideoUploadWithOrder() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [openGenreSelect, setOpenGenreSelect] = useState(false);

  const [subtitleConfig, setSubtitleConfig] = useState({
    enable_translation: false,
    target_language: "es",
    max_chars_per_line: 42,
    lines_per_subtitle: 2,
    accessibility_mode: false,
    content_type: "subtitles_only",
    genres: ["general"],
    output_format: "srt",
    sound_delay_seconds: 0,
  });

  const [pricePerMinute, setPricePerMinute] = useState(1);
  const [currency, setCurrency] = useState("USD");

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
  ];

  const genres = [
    "general",
    "horror",
    "comedy",
    "romance",
    "action",
    "documentary",
    "news",
    "podcast",
  ];

  const outputFormats = [
    { value: "srt", name: "SRT (SubRip)" },
    { value: "vtt", name: "VTT (WebVTT)" },
    { value: "ass", name: "ASS (Advanced SSA)" },
    { value: "txt", name: "Text File (TXT)" },
  ];

  const soundDelayOptions = [
    { value: 0, name: "No Delay", description: "All detected sounds included" },
    { value: 1, name: "1 Second", description: "Minimum 1s between sounds" },
    { value: 5, name: "5 Seconds", description: "Minimum 5s between sounds" },
    {
      value: 10,
      name: "10 Seconds",
      description: "Minimum 10s between sounds",
    },
    {
      value: 30,
      name: "30 Seconds",
      description: "Minimum 30s between sounds",
    },
  ];
  const fetchPricing = async () => {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/pricing/price-per-minute`,
        {
          headers: authHeaders,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPricePerMinute(data.price_per_minute);
        setCurrency(data.currency);
      }
    } catch (error) {
      console.error("Failed to fetch pricing:", error);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  useEffect(() => {
    // Calculate estimated cost based on uploaded videos
    const totalDuration = uploadedVideos.reduce(
      (sum, video) => sum + video.duration,
      0
    );
    setEstimatedCost((totalDuration / 60) * pricePerMinute);
  }, [uploadedVideos, pricePerMinute]);

  const handleFileSelect = (files) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("video/")) {
        if (file.size > 500 * 1024 * 1024) {
          toast.error("File size exceeds limit", {
            description: "Maximum file size is 500MB",
          });
          return;
        }
        uploadVideo(file);
      } else {
        toast.error("Invalid file type", {
          description: "Please upload video files only",
        });
      }
    });
  };

  const uploadVideo = async (file) => {
    setUploading(true);

    try {
      console.log("Uploading file:", file.name, file.type, file.size);
      const formData = new FormData();
      formData.append("file", file);

      // Get auth headers but exclude Content-Type and CORS headers
      const authHeaders = await getAuthHeaders();
      const { "Content-Type": _, ...filteredHeaders } = authHeaders;

      const response = await fetch(`${API_BASE_URL}/api/orders/videos/upload`, {
        method: "POST",
        headers: {
          ...filteredHeaders,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Upload response:", data);
      setUploadedVideos((prev) => [...prev, { ...data, file }]);
      toast.success("Video uploaded successfully", {
        description: `${file.name} has been uploaded`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = (id) => {
    setUploadedVideos((prev) => prev.filter((video) => video.id !== id));
    toast.success("Video removed");
  };

  const handleConfigChange = (key, value) => {
    setSubtitleConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreateOrder = async () => {
    if (uploadedVideos.length === 0) {
      toast.error("Please upload at least one video");
      return;
    }

    setCreating(true);

    try {
      const authHeaders = await getAuthHeaders();

      const orderData = {
        videos: uploadedVideos.map((video) => video.id),
        subtitle_config: {
          enable_translation: subtitleConfig.enable_translation,
          target_language: subtitleConfig.target_language,
          max_chars_per_line: subtitleConfig.max_chars_per_line,
          lines_per_subtitle: subtitleConfig.lines_per_subtitle,
          accessibility_mode: subtitleConfig.accessibility_mode,
          content_type: subtitleConfig.content_type,
          genres: subtitleConfig.genres,
          output_format: subtitleConfig.output_format,
        },
      };

      const response = await fetch(`${API_BASE_URL}/api/orders/create`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Order created:", data);

      toast.success("Order created successfully!", {
        description: `Order #${data.id} has been created`,
      });

      // Redirect to orders page or dashboard
      router.push("/user/orders");
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Failed to create order", {
        description: error.message || "Please try again",
      });
    } finally {
      setCreating(false);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "uploaded":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileVideo className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const totalDuration = uploadedVideos.reduce(
    (sum, video) => sum + video.duration,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              href="/user/dashboard"
              className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              Upload Videos & Create Order
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Area */}
        <div className="mb-8">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload your videos
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your video files here, or click to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Choose Files"}
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Supported formats: MP4, AVI, MOV, WMV (Max 500MB per file)
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Videos */}
        {uploadedVideos.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Uploaded Videos ({uploadedVideos.length})
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {uploadedVideos.map((video) => (
                <div key={video.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileVideo className="h-6 w-6 text-gray-600" />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {video.original_filename}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDuration(video.duration)}
                          </span>
                          {video.file && (
                            <span>{formatFileSize(video.file.size)}</span>
                          )}
                          <span className="flex items-center">
                            {getStatusIcon(video.status)}
                            <span className="ml-1 capitalize">
                              {video.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeVideo(video.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {uploadedVideos.length} video
                  {uploadedVideos.length !== 1 ? "s" : ""} ready for processing
                </p>
                <button
                  onClick={() => setShowOrderForm(!showOrderForm)}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {showOrderForm ? "Hide" : "Create"} Order
                  {showOrderForm ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Creation Form */}
        {showOrderForm && uploadedVideos.length > 0 && (
          <div className="space-y-8">
            {/* Subtitle Configuration */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Subtitle Configuration
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Content Type and Translation Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Globe className="h-4 w-4 inline mr-1" />
                      <span> Content Type</span>
                    </label>
                    <select
                      value={subtitleConfig.content_type}
                      onChange={(e) =>
                        handleConfigChange("content_type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="subtitles_only">Subtitles Only</option>
                      <option value="sounds_only">Sounds Only</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center mt-2">
                      <Clock className="h-4 w-4 mr-1 " />
                      <span> Sound Delay</span>
                    </label>
                    <select
                      value={subtitleConfig.sound_delay_seconds}
                      onChange={(e) =>
                        handleConfigChange(
                          "sound_delay_seconds",
                          Number.parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      {soundDelayOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Text Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Type className="h-4 w-4 inline mr-1" />
                      <span>Max Characters per Line</span>
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="80"
                      value={subtitleConfig.max_chars_per_line}
                      onChange={(e) =>
                        handleConfigChange(
                          "max_chars_per_line",
                          Number.parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Type className="h-4 w-4 inline mr-1" />
                      Lines per Subtitle
                    </label>
                    <select
                      value={subtitleConfig.lines_per_subtitle}
                      onChange={(e) =>
                        handleConfigChange(
                          "lines_per_subtitle",
                          Number.parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value={1}>1 Line</option>
                      <option value={2}>2 Lines</option>
                      <option value={3}>3 Lines</option>
                    </select>
                  </div>
                </div>

                {/* Genre and Format */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Film className="h-4 w-4 inline mr-1" />
                      Genres
                    </label>
                    <Popover
                      open={openGenreSelect}
                      onOpenChange={setOpenGenreSelect}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openGenreSelect}
                          className="w-full justify-between"
                        >
                          {subtitleConfig.genres.length > 0
                            ? `${subtitleConfig.genres.length} genre${
                                subtitleConfig.genres.length > 1 ? "s" : ""
                              } selected`
                            : "Select genres..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search genres..." />
                          <CommandList>
                            <CommandEmpty>No genre found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {genres.map((genre) => (
                                <CommandItem
                                  key={genre}
                                  onSelect={() => {
                                    const updatedGenres =
                                      subtitleConfig.genres.includes(genre)
                                        ? subtitleConfig.genres.filter(
                                            (g) => g !== genre
                                          )
                                        : [...subtitleConfig.genres, genre];
                                    handleConfigChange("genres", updatedGenres);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      subtitleConfig.genres.includes(genre)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {genre.charAt(0).toUpperCase() +
                                    genre.slice(1)}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Selected Genres Display */}
                    {subtitleConfig.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {subtitleConfig.genres.map((genre) => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="text-xs"
                          >
                            {genre.charAt(0).toUpperCase() + genre.slice(1)}
                            <button
                              onClick={() => {
                                const updatedGenres =
                                  subtitleConfig.genres.filter(
                                    (g) => g !== genre
                                  );
                                handleConfigChange("genres", updatedGenres);
                              }}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FileText className="h-4 w-4 inline mr-1" />
                      Output Format
                    </label>
                    <select
                      value={subtitleConfig.output_format}
                      onChange={(e) =>
                        handleConfigChange("output_format", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      {outputFormats.map((format) => (
                        <option key={format.value} value={format.value}>
                          {format.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  {subtitleConfig.enable_translation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Language
                      </label>
                      <select
                        value={subtitleConfig.target_language}
                        onChange={(e) =>
                          handleConfigChange("target_language", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Special Options */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Special Options
                  </h4>

                  <div className="space-y-3">
                    <label className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        checked={subtitleConfig.enable_translation}
                        onChange={(e) =>
                          handleConfigChange(
                            "enable_translation",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-2"
                      />
                      <Globe className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm  text-gray-700">
                        Enable Translation
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={subtitleConfig.accessibility_mode}
                        onChange={(e) =>
                          handleConfigChange(
                            "accessibility_mode",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <Accessibility className="h-4 w-4 ml-2 mr-1 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Accessibility Mode
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        (Includes sound descriptions)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary and Create */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Summary
                </h3>
              </div>

              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      Order Details
                    </span>
                    <CreditCard className="h-4 w-4 text-gray-500" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Videos:</span>
                      <span className="font-medium">
                        {uploadedVideos.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Duration:</span>
                      <span className="font-medium">
                        {formatDuration(totalDuration)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Content Type:</span>
                      <span className="font-medium">
                        {subtitleConfig.content_type
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Genres:</span>
                      <span className="font-medium">
                        {subtitleConfig.genres
                          .map((g) => g.charAt(0).toUpperCase() + g.slice(1))
                          .join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Translation:</span>
                      <span className="font-medium">
                        {subtitleConfig.enable_translation
                          ? `Enabled (${
                              languages.find(
                                (l) => l.code === subtitleConfig.target_language
                              )?.name
                            })`
                          : "Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-medium text-gray-900">
                        Estimated Cost:
                      </span>
                      <span className="font-bold text-primary">
                        {currency === "USD" ? "$" : currency}
                        {estimatedCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCreateOrder}
                  disabled={creating || uploadedVideos.length === 0}
                  className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {creating ? "Creating Order..." : "Create Order"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Upload Guidelines
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Maximum file size: 500MB per video</li>
            <li>• Supported formats: MP4, AVI, MOV, WMV, MKV</li>
            <li>
              • For best results, use clear audio with minimal background noise
            </li>
            <li>
              • Videos with multiple speakers may require additional processing
              time
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
