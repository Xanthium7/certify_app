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

const steps = ["upload", "customize", "batch", "download"];

export default function CertificateFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [svgCode, setSvgCode] = useState<string | null>(null);
  const [customizedSvg, setCustomizedSvg] = useState<string | null>(null);
  const [batchData, setBatchData] = useState<string[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);

  const handleImageUpload = (imageUrl: string) => {
    setCertificateImage(imageUrl);
    console.log("Received image URL:", imageUrl);

    // Simulate AI processing - in real app, this would call your AI endpoint
    setIsProcessing(true);
    setTimeout(() => {
      // Example SVG code - this would come from your AI service
      // ...existing code...
      const placeholderSvg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="bgGrad" cx="50%" cy="50%" r="80%">
    <stop offset="0%" stop-color="#fffbe6"/>
    <stop offset="100%" stop-color="#f8f9fa"/>
  </radialGradient>
  <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#ffd700"/>
    <stop offset="100%" stop-color="#ffb700"/>
  </linearGradient>
</defs>
<rect width="100%" height="100%" fill="url(#bgGrad)" />
<rect x="30" y="30" width="740" height="540" rx="24" fill="none" stroke="#bfa76f" stroke-width="8"/>
<rect x="50" y="50" width="700" height="500" rx="16" fill="none" stroke="#6c757d" stroke-width="2"/>
<text x="400" y="120" font-family="Georgia, serif" font-size="38" text-anchor="middle" fill="#bfa76f" font-weight="bold" letter-spacing="2">Certificate of Achievement</text>
<text x="400" y="180" font-family="Arial" font-size="22" text-anchor="middle" fill="#212529">This is proudly presented to</text>
<text x="400" y="250" font-family="Georgia, serif" font-size="32" text-anchor="middle" fill="#212529" font-weight="bold" id="name">John Doe</text>
<text x="400" y="300" font-family="Arial" font-size="20" text-anchor="middle" fill="#212529" id="message">For outstanding performance in the course</text>
<circle cx="120" cy="480" r="48" fill="url(#gold)" stroke="#bfa76f" stroke-width="4"/>
<text x="120" y="488" font-family="Georgia, serif" font-size="24" text-anchor="middle" fill="#fff" font-weight="bold">★</text>
<text x="400" y="400" font-family="Arial" font-size="18" text-anchor="middle" fill="#212529" id="date">June 1, 2023</text>
<text x="650" y="500" font-family="Georgia, serif" font-size="18" text-anchor="middle" fill="#6c757d">Signature</text>
<line x1="600" y1="510" x2="700" y2="510" stroke="#bfa76f" stroke-width="2"/>
</svg>`;

      setSvgCode(placeholderSvg);
      setCustomizedSvg(placeholderSvg);
      setIsProcessing(false);
      setCurrentStep(1);
    }, 2000);
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
      // Simulate generated files
      setGeneratedFiles(
        data.map((row, i) => `certificate_${row[0].replace(/\s+/g, "_")}.svg`)
      );
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
