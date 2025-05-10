"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import UploadCertificate from "@/components/upload-certificate";
import CustomizeCertificate from "@/components/customize-certificate";
import BatchProcess from "@/components/batch-process";
import DownloadResults from "@/components/download-results";
import Image from "next/image";
import { ai_slop } from "@/actions/actions";

const steps = ["upload", "customize", "batch", "download"];

export default function CertificateFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [svgCode, setSvgCode] = useState<string | null>(null);
  const [customizedSvg, setCustomizedSvg] = useState<string | null>(null);
  const [batchData, setBatchData] = useState<string[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<
    Array<{ name: string; content: string }>
  >([]);

  const handleImageUpload = (imageUrl: string) => {
    setCertificateImage(imageUrl);
    console.log("Received image URL:", imageUrl);

    setIsProcessing(true);
    ai_slop_handler(imageUrl);
  };

  const ai_slop_handler = async (imagePath: string) => {
    try {
      const response = await ai_slop(imagePath);
      if (response) {
        setSvgCode(response);
        setCustomizedSvg(response);
        setCurrentStep(1);
      } else {
        console.error("No SVG was generated");
      }
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomization = (updatedSvg: string) => {
    setCustomizedSvg(updatedSvg);
    setCurrentStep(2);
  };

  const handleBatchUpload = (data: string[][]) => {
    setBatchData(data);

    // Simulate batch processing - in real app, this would call your backend
    setIsProcessing(true);
    setTimeout(() => {
      // Generate files with both name and SVG content
      const files = data.map((row, i) => {
        const filename = `certificate_${row[0].replace(/\s+/g, "_")}.svg`;
        // Replace placeholder values in the SVG with data from the CSV
        let svgWithData = customizedSvg || "";
        row.forEach((value, index) => {
          // Replace {{index}} placeholders with actual values
          svgWithData = svgWithData.replace(
            new RegExp(`\\{\\{${index}\\}\\}`, "g"),
            value
          );
        });
        return { name: filename, content: svgWithData };
      });

      setGeneratedFiles(files);
      setIsProcessing(false);
      setCurrentStep(3);
    }, 2000);
  };

  const handleRetry = () => {
    setCurrentStep(0);
    setSvgCode(null);
    setCustomizedSvg(null);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCertificateImage(null);
    setSvgCode(null);
    setCustomizedSvg(null);
    setBatchData([]);
    setGeneratedFiles([]);
  };

  return (
    <div className="space-y-8">
      <Progress value={(currentStep + 1) * 25} className="h-2" />

      <Tabs value={steps[currentStep]} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="upload" disabled={currentStep !== 0}>
            1. Upload
          </TabsTrigger>
          <TabsTrigger value="customize" disabled={currentStep !== 1}>
            2. Customize
          </TabsTrigger>
          <TabsTrigger value="batch" disabled={currentStep !== 2}>
            3. Batch
          </TabsTrigger>
          <TabsTrigger value="download" disabled={currentStep !== 3}>
            4. Download
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card className="p-6">
            <UploadCertificate
              onUpload={handleImageUpload}
              isProcessing={isProcessing}
            />
          </Card>
        </TabsContent>

        <TabsContent value="customize" className="mt-6">
          <Card className="p-6">
            <CustomizeCertificate
              svgCode={svgCode || ""}
              onSave={handleCustomization}
              onRetry={handleRetry}
            />
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="mt-6">
          <Card className="p-6">
            <BatchProcess
              onUpload={handleBatchUpload}
              isProcessing={isProcessing}
            />
          </Card>
        </TabsContent>

        <TabsContent value="download" className="mt-6">
          <Card className="p-6">
            <DownloadResults files={generatedFiles} onReset={handleReset} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
