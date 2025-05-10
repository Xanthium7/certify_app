"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadCertificateProps {
  onUpload: (imageUrl: string) => void;
  isProcessing: boolean;
}

export default function UploadCertificate({
  onUpload,
  isProcessing,
}: UploadCertificateProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match("image.*")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (previewUrl) {
      onUpload(previewUrl);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
      // Handle pasted files
      const file = e.clipboardData.files[0];
      if (file.type.match("image.*")) {
        e.preventDefault();
        handleFile(file);
      }
    } else if (e.clipboardData && e.clipboardData.items) {
      // Look for image content in clipboard items
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        if (e.clipboardData.items[i].type.indexOf("image") !== -1) {
          const file = e.clipboardData.items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
            break;
          }
        }
      }
    }
  };

  useEffect(() => {
    // Add paste event listener to window
    window.addEventListener("paste", handlePaste);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Upload Certificate Template</h2>
        <p className="text-muted-foreground">
          Upload an image of a certificate to convert it to an editable SVG
        </p>
        <p className="text-xs text-muted-foreground">
          You can also paste an image from clipboard (Ctrl+V)
        </p>
      </div>

      <div
        ref={dropZoneRef}
        className={`border-2 border-dashed rounded-lg p-10 text-center ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        } cursor-pointer`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={previewUrl ? undefined : handleButtonClick}
      >
        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative max-w-md mx-auto">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Certificate preview"
                className="rounded-md shadow-md max-h-[300px] mx-auto"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setPreviewUrl(null)}
              >
                Change
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Drag and drop your certificate image, or{" "}
                <span
                  className="text-primary cursor-pointer hover:underline"
                  onClick={handleButtonClick}
                >
                  browse
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports JPG, PNG, GIF up to 10MB
              </p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />
      </div>

      {previewUrl && (
        <div className="flex justify-end">
          <Button onClick={handleUpload} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Convert to SVG"}
          </Button>
        </div>
      )}
    </div>
  );
}
