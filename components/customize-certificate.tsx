"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";

interface CustomizeCertificateProps {
  svgCode: string;
  onSave: (updatedSvg: string) => void;
  onRetry: () => void;
}

export default function CustomizeCertificate({
  svgCode,
  onSave,
  onRetry,
}: CustomizeCertificateProps) {
  const [editableSvg, setEditableSvg] = useState(svgCode);
  const [name, setName] = useState("John Doe");
  const [message, setMessage] = useState(
    "has successfully completed the course"
  );
  const [date, setDate] = useState("June 1, 2023");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");

  // Pan state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);

  // Zoom state
  const [zoom, setZoom] = useState(1);

  // Mouse/touch handlers for panning
  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    setDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX, y: clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging || !dragStart.current) return;
    const clientX =
      "touches" in e
        ? (e as TouchEvent).touches[0]?.clientX ?? dragStart.current.x
        : (e as MouseEvent).clientX;
    const clientY =
      "touches" in e
        ? (e as TouchEvent).touches[0]?.clientY ?? dragStart.current.y
        : (e as MouseEvent).clientY;
    setPan({
      x: dragStart.current.panX + (clientX - dragStart.current.x),
      y: dragStart.current.panY + (clientY - dragStart.current.y),
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
    dragStart.current = null;
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove);
      window.addEventListener("touchend", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  // Parse SVG to find editable fields
  useEffect(() => {
    if (svgCode) {
      // In a real app, you would parse the SVG to find editable fields
      // For this example, we're using hardcoded fields
      setEditableSvg(svgCode);
    }
  }, [svgCode]);

  const updateSvgField = (id: string, value: string) => {
    // This is a simplified approach - in a real app you'd use a proper XML parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(editableSvg, "image/svg+xml");
    const element = doc.getElementById(id);

    if (element) {
      element.textContent = value;
      const serializer = new XMLSerializer();
      setEditableSvg(serializer.serializeToString(doc));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    updateSvgField("name", e.target.value);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    updateSvgField("message", e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    updateSvgField("date", e.target.value);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableSvg(e.target.value);
  };

  const handleSave = () => {
    onSave(editableSvg);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Customize Certificate</h2>
        <p className="text-muted-foreground">
          Edit the text fields and preview your certificate
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter recipient name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              value={message}
              onChange={handleMessageChange}
              placeholder="Enter certificate message"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              value={date}
              onChange={handleDateChange}
              placeholder="Enter date"
            />
          </div>

          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "preview" | "code")}
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">SVG Code</TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="svg-code">SVG Code</Label>
                <textarea
                  id="svg-code"
                  value={editableSvg}
                  onChange={handleCodeChange}
                  className="w-full h-[200px] font-mono text-sm p-2 border rounded-md"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div
          className="border rounded-md p-4 bg-white overflow-visible"
          style={{ minHeight: "500px", minWidth: "100%", position: "relative" }}
        >
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <div
            className="w-full h-full flex items-center justify-center svg-container"
            style={{
              cursor: dragging ? "grabbing" : "grab",
              overflow: "auto",
              width: "100%",
              height: "500px",
              touchAction: "none",
              userSelect: "none",
              position: "relative",
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: dragging ? "none" : "transform 0.1s",
                display: "inline-block",
                transformOrigin: "0 0",
              }}
              // Prevent text selection while dragging
              onDragStart={(e) => e.preventDefault()}
              dangerouslySetInnerHTML={{
                __html: editableSvg.replace(
                  /<svg/,
                  '<svg width="1000" height="700" preserveAspectRatio="xMidYMid meet"'
                ),
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry with Different Image
        </Button>

        <Button onClick={handleSave}>
          <Check className="mr-2 h-4 w-4" />
          Accept and Continue
        </Button>
      </div>
    </div>
  );
}
