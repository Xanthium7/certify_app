"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileSpreadsheet, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface BatchProcessProps {
  onUpload: (data: string[][]) => void
  isProcessing: boolean
}

export default function BatchProcess({ onUpload, isProcessing }: BatchProcessProps) {
  const [method, setMethod] = useState<"csv" | "manual">("csv")
  const [csvData, setCsvData] = useState<string[][]>([])
  const [manualEntries, setManualEntries] = useState<string[][]>([["", "", ""]])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCsvFile(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const rows = text.split("\n").map((row) => row.split(","))
        setCsvData(rows.filter((row) => row.some((cell) => cell.trim() !== "")))
      }
      reader.readAsText(file)
    }
  }

  const handleManualEntryChange = (rowIndex: number, colIndex: number, value: string) => {
    const newEntries = [...manualEntries]
    newEntries[rowIndex][colIndex] = value
    setManualEntries(newEntries)
  }

  const addManualEntry = () => {
    setManualEntries([...manualEntries, ["", "", ""]])
  }

  const removeManualEntry = (index: number) => {
    if (manualEntries.length > 1) {
      const newEntries = [...manualEntries]
      newEntries.splice(index, 1)
      setManualEntries(newEntries)
    }
  }

  const handleSubmit = () => {
    if (method === "csv" && csvData.length > 0) {
      onUpload(csvData)
    } else if (method === "manual" && manualEntries.some((entry) => entry[0].trim() !== "")) {
      onUpload(manualEntries.filter((entry) => entry[0].trim() !== ""))
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Batch Process</h2>
        <p className="text-muted-foreground">
          Upload a CSV file or manually enter names to generate multiple certificates
        </p>
      </div>

      <Tabs value={method} onValueChange={(v) => setMethod(v as "csv" | "manual")}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="csv">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV Upload
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Plus className="mr-2 h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="mt-4 space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                {csvFile ? (
                  <p className="font-medium">{csvFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">Click to upload a CSV file</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      CSV should have columns for name, message, and date
                    </p>
                  </>
                )}
              </div>
            </div>
            <input ref={fileInputRef} type="file" className="hidden" accept=".csv" onChange={handleCsvUpload} />
          </div>

          {csvData.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row[0] || "-"}</TableCell>
                      <TableCell>{row[1] || "-"}</TableCell>
                      <TableCell>{row[2] || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {csvData.length > 5 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Showing 5 of {csvData.length} entries
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="mt-4 space-y-4">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Message (Optional)</TableHead>
                  <TableHead>Date (Optional)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manualEntries.map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell className="p-2">
                      <Input
                        value={entry[0]}
                        onChange={(e) => handleManualEntryChange(i, 0, e.target.value)}
                        placeholder="Enter name"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        value={entry[1]}
                        onChange={(e) => handleManualEntryChange(i, 1, e.target.value)}
                        placeholder="Enter message"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input
                        value={entry[2]}
                        onChange={(e) => handleManualEntryChange(i, 2, e.target.value)}
                        placeholder="Enter date"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeManualEntry(i)}
                        disabled={manualEntries.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button variant="outline" onClick={addManualEntry}>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={
            isProcessing ||
            (method === "csv" && csvData.length === 0) ||
            (method === "manual" && !manualEntries.some((entry) => entry[0].trim() !== ""))
          }
        >
          {isProcessing ? "Processing..." : "Generate Certificates"}
        </Button>
      </div>
    </div>
  )
}
