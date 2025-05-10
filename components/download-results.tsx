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
  const [conversionStatus, setConversionStatus] = useState<{
    [key: string]: "idle" | "processing" | "error";
  }>({});

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

  const handleDownloadSvg = (fileName: string, content: string) => {
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
  };

  const handleDownloadPng = async (
    fileName: string,
    content: string,
    index: number
  ) => {
    // Set status to processing for this file
    setConversionStatus((prev) => ({ ...prev, [index]: "processing" }));

    try {
      // Create a container for the SVG
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.innerHTML = content;
      document.body.appendChild(container);

      // Wait for the SVG to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the SVG element
      const svgElement = container.querySelector("svg");

      if (!svgElement) {
        throw new Error("SVG element not found");
      }

      // Get dimensions
      const bbox = svgElement.getBBox();
      const width = bbox.width || svgElement.width?.baseVal?.value || 800;
      const height = bbox.height || svgElement.height?.baseVal?.value || 600;

      // Serialize SVG with dimensions
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);

      // Ensure SVG has proper width and height
      if (!svgString.includes("width=")) {
        svgString = svgString.replace("<svg", `<svg width="${width}"`);
      }
      if (!svgString.includes("height=")) {
        svgString = svgString.replace("<svg", `<svg height="${height}"`);
      }

      // Create SVG data URL
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Clean up container
      document.body.removeChild(container);

      // Convert to PNG using an Image and canvas
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            // Create canvas with proper dimensions
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw SVG on canvas
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              throw new Error("Could not get canvas context");
            }

            ctx.drawImage(img, 0, 0);

            // Convert to PNG and download
            canvas.toBlob((blob) => {
              if (!blob) {
                throw new Error("Could not create PNG blob");
              }

              const pngUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = pngUrl;
              link.download = fileName.replace(".svg", ".png");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              // Clean up
              URL.revokeObjectURL(pngUrl);
              URL.revokeObjectURL(svgUrl);
              setConversionStatus((prev) => ({ ...prev, [index]: "idle" }));
              resolve();
            }, "image/png");
          } catch (error) {
            console.error("Error converting SVG to PNG:", error);
            URL.revokeObjectURL(svgUrl);
            setConversionStatus((prev) => ({ ...prev, [index]: "error" }));
            reject(error);

            // Fallback to SVG download
            handleDownloadSvg(fileName, content);
          }
        };

        img.onerror = (error) => {
          console.error("Error loading SVG:", error);
          URL.revokeObjectURL(svgUrl);
          setConversionStatus((prev) => ({ ...prev, [index]: "error" }));
          reject(error);

          // Fallback to SVG download
          handleDownloadSvg(fileName, content);
        };

        img.src = svgUrl;
      });
    } catch (error) {
      console.error("Error in SVG to PNG conversion:", error);
      setConversionStatus((prev) => ({ ...prev, [index]: "error" }));

      // Fallback to SVG download
      handleDownloadSvg(fileName, content);
    }
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
                  onClick={() => handleDownloadSvg(file.name, file.content)}
                >
                  SVG
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={conversionStatus[i] === "processing"}
                  onClick={() => handleDownloadPng(file.name, file.content, i)}
                >
                  {conversionStatus[i] === "processing"
                    ? "Converting..."
                    : "PNG"}
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
