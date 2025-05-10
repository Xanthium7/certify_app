"use client";

import { Button } from "@/components/ui/button";
import { Download, RefreshCw, FileDown } from "lucide-react";
import { useState } from "react";

interface DownloadResultsProps {
  files: Array<{ name: string; content: string }>;
  onReset: () => void;
}

export default function DownloadResults({
  files,
  onReset,
}: DownloadResultsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAll = async () => {
    setIsDownloading(true);

    try {
      // Dynamically import JSZip only when needed
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Add all files to the zip
      files.forEach((file) => {
        zip.file(file.name, file.content);
      });

      // Generate zip file
      const zipContent = await zip.generateAsync({ type: "blob" });

      // Create and trigger download
      const url = URL.createObjectURL(zipContent);
      const link = document.createElement("a");
      link.href = url;
      link.download = "certificates.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating zip file:", error);
      alert("Failed to create ZIP file. Please download files individually.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSingle = (
    fileName: string,
    content: string,
    format: "svg" | "png" = "png"
  ) => {
    if (format === "svg") {
      // Direct SVG download
      const blob = new Blob([content], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    // Convert SVG to PNG
    const blob = new Blob([content], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Handle conversion errors
    const handleError = () => {
      console.error("Failed to convert SVG to PNG");
      URL.revokeObjectURL(url);
      // Fallback to SVG download
      handleDownloadSingle(fileName, content, "svg");
    };

    img.onload = () => {
      try {
        // Set canvas dimensions to match SVG
        canvas.width = img.width || 800; // Fallback size if width is 0
        canvas.height = img.height || 600; // Fallback size if height is 0

        // Draw image on canvas
        if (ctx) {
          ctx.drawImage(img, 0, 0);

          // Convert canvas to PNG
          const pngUrl = canvas.toDataURL("image/png");

          // Create download link for PNG
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = fileName.replace(".svg", ".png");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          handleError();
        }
      } catch (error) {
        handleError();
      } finally {
        // Clean up
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = handleError;

    // Set image source to SVG blob
    img.src = url;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Download Certificates</h2>
        <p className="text-muted-foreground">
          Your certificates are ready for download
        </p>
      </div>

      <div className="bg-primary/5 rounded-lg p-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Download className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {files.length} Certificate{files.length !== 1 ? "s" : ""} Generated
        </h3>
        <p className="text-muted-foreground mb-6">
          All certificates have been successfully generated and are ready for
          download
        </p>
        <Button size="lg" onClick={handleDownloadAll} disabled={isDownloading}>
          <Download className="mr-2 h-5 w-5" />
          {isDownloading ? "Creating ZIP..." : "Download All as ZIP"}
        </Button>
      </div>

      {files.length > 0 && (
        <div className="border rounded-md divide-y">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <FileDown className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>{file.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownloadSingle(file.name, file.content, "svg")
                  }
                >
                  SVG
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadSingle(file.name, file.content)}
                >
                  PNG
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Start New Batch
        </Button>
      </div>
    </div>
  );
}
