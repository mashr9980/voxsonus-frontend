"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Download,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Settings,
  Merge,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAuthHeaders } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";

export default function SubtitleMerger() {
  const speechFileRef = useRef(null);
  const soundsFileRef = useRef(null);

  const [speechFile, setSpeechFile] = useState(null);
  const [soundsFile, setSoundsFile] = useState(null);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [outputFormat, setOutputFormat] = useState("srt");
  const [isUploading, setIsUploading] = useState(false);
  const [mergeResult, setMergeResult] = useState(null);
  const [dragActive, setDragActive] = useState({
    speech: false,
    sounds: false,
  });

  const outputFormats = [
    { value: "srt", name: "SRT (SubRip)" },
    { value: "vtt", name: "VTT (WebVTT)" },
    { value: "ass", name: "ASS (Advanced SSA)" },
    { value: "txt", name: "Text File" },
  ];

  const handleFileSelect = (file, type) => {
    if (!file) return;

    // Validate file type (should be subtitle files)
    const validExtensions = [".srt", ".vtt", ".ass", ".txt", ".sub"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      toast.error("Invalid file type", {
        description:
          "Please upload subtitle files (.srt, .vtt, .ass, .txt, .sub)",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error("File too large", {
        description: "Maximum file size is 10MB",
      });
      return;
    }

    if (type === "speech") {
      setSpeechFile(file);
      toast.success("Speech file uploaded", {
        description: file.name,
      });
    } else {
      setSoundsFile(file);
      toast.success("Sounds file uploaded", {
        description: file.name,
      });
    }
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive((prev) => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0], type);
    }
  };

  const removeFile = (type) => {
    if (type === "speech") {
      setSpeechFile(null);
    } else {
      setSoundsFile(null);
    }
    toast.success("File removed");
  };

  const handleMerge = async () => {
    if (!speechFile || !soundsFile) {
      toast.error("Missing files", {
        description: "Please upload both speech and sounds files",
      });
      return;
    }

    setIsUploading(true);
    setMergeResult(null);

    try {
      const formData = new FormData();
      formData.append("speech_file", speechFile);
      formData.append("sounds_file", soundsFile);
      formData.append("accessibility_mode", accessibilityMode.toString());
      formData.append("output_format", outputFormat);

      const authHeaders = await getAuthHeaders();
      const { "Content-Type": _, ...filteredHeaders } = authHeaders;

      const response = await fetch(`${API_BASE_URL}/api/subtitles/merge`, {
        method: "POST",
        headers: {
          ...filteredHeaders,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setMergeResult(data);

      toast.success("Files merged successfully!", {
        description: "Your merged subtitle file is ready for download",
      });
    } catch (error) {
      console.error("Merge error:", error);
      toast.error("Merge failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!mergeResult?.file_id) return;

    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/subtitles/merged/${mergeResult.file_id}/download`,
        {
          headers: authHeaders,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.download_url) {
        // Create download link
        const link = document.createElement("a");
        link.href = data.download_url;
        link.download = `merged_subtitles.${outputFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Download started");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed", {
        description: "Please try again",
      });
    }
  };

  const resetForm = () => {
    setSpeechFile(null);
    setSoundsFile(null);
    setMergeResult(null);
    setAccessibilityMode(false);
    setOutputFormat("srt");
  };

  const formatFileSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              href="/user/dashboard"
              className="flex items-center text-gray-500 hover:text-gray-700 mr-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Subtitle Merger
              </h1>
              <p className="text-sm text-gray-600">
                Merge speech and sound subtitle files
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Subtitle Files
              </CardTitle>
              <CardDescription>
                Upload your speech and sounds subtitle files to merge them into
                a single file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Speech File Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Speech Subtitle File
                  </Label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                      dragActive.speech
                        ? "border-primary bg-primary/5 scale-105"
                        : speechFile
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                    onDragEnter={(e) => handleDrag(e, "speech")}
                    onDragLeave={(e) => handleDrag(e, "speech")}
                    onDragOver={(e) => handleDrag(e, "speech")}
                    onDrop={(e) => handleDrop(e, "speech")}
                  >
                    <input
                      ref={speechFileRef}
                      type="file"
                      accept=".srt,.vtt,.ass,.txt,.sub"
                      onChange={(e) =>
                        handleFileSelect(e.target.files[0], "speech")
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {speechFile ? (
                      <div className="space-y-2">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-green-700">
                            {speechFile.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {formatFileSize(speechFile.size)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile("speech");
                          }}
                          className="mt-2"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Drop speech file here
                          </p>
                          <p className="text-xs text-gray-500">
                            or click to browse
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => speechFileRef.current?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sounds File Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Sounds Subtitle File
                  </Label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                      dragActive.sounds
                        ? "border-primary bg-primary/5 scale-105"
                        : soundsFile
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                    onDragEnter={(e) => handleDrag(e, "sounds")}
                    onDragLeave={(e) => handleDrag(e, "sounds")}
                    onDragOver={(e) => handleDrag(e, "sounds")}
                    onDrop={(e) => handleDrop(e, "sounds")}
                  >
                    <input
                      ref={soundsFileRef}
                      type="file"
                      accept=".srt,.vtt,.ass,.txt,.sub"
                      onChange={(e) =>
                        handleFileSelect(e.target.files[0], "sounds")
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {soundsFile ? (
                      <div className="space-y-2">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-green-700">
                            {soundsFile.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {formatFileSize(soundsFile.size)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile("sounds");
                          }}
                          className="mt-2"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Drop sounds file here
                          </p>
                          <p className="text-xs text-gray-500">
                            or click to browse
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => soundsFileRef.current?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Supported formats: SRT, VTT, ASS, TXT, SUB • Maximum file
                  size: 10MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Merge Configuration
              </CardTitle>
              <CardDescription>
                Configure how your subtitle files should be merged
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="output-format"
                    className="text-sm font-medium text-gray-700"
                  >
                    Output Format
                  </Label>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select output format" />
                    </SelectTrigger>
                    <SelectContent>
                      {outputFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Accessibility Mode
                  </Label>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Switch
                      id="accessibility-mode"
                      checked={accessibilityMode}
                      onCheckedChange={setAccessibilityMode}
                    />
                    <div>
                      <Label
                        htmlFor="accessibility-mode"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Enable accessibility features
                      </Label>
                      <p className="text-xs text-gray-500">
                        Includes enhanced descriptions for accessibility
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleMerge}
                    disabled={!speechFile || !soundsFile || isUploading}
                    size="lg"
                    className="min-w-[140px]"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Merging...
                      </>
                    ) : (
                      <>
                        <Merge className="h-4 w-4 mr-2" />
                        Merge Files
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isUploading}
                  >
                    Reset
                  </Button>
                </div>

                {speechFile && soundsFile && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Ready to merge
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Result Section */}
          {mergeResult && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Merge Successful
                </CardTitle>
                <CardDescription className="text-green-700">
                  {mergeResult.message}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-800">
                      File ID: {mergeResult.file_id}
                    </p>
                    <p className="text-xs text-green-600">
                      Format: {outputFormat.toUpperCase()} • Accessibility:{" "}
                      {accessibilityMode ? "Enabled" : "Disabled"}
                    </p>
                  </div>

                  <Button
                    onClick={handleDownload}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Merged File
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 text-lg">
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">Speech File</h4>
                  <p>
                    Upload the subtitle file containing speech/dialogue content.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sounds File</h4>
                  <p>
                    Upload the subtitle file containing sound effects and music
                    descriptions.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Output Format</h4>
                  <p>Choose the format for your merged subtitle file.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Accessibility Mode</h4>
                  <p>
                    Enable enhanced descriptions for better accessibility
                    support.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
