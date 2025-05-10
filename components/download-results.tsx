"use client"

import { Button } from "@/components/ui/button"
import { Download, RefreshCw, FileDown } from "lucide-react"

interface DownloadResultsProps {
  files: string[]
  onReset: () => void
}

export default function DownloadResults({ files, onReset }: DownloadResultsProps) {
  const handleDownloadAll = () => {
    // In a real app, this would trigger a download of the ZIP file
    alert("In a real implementation, this would download a ZIP file with all certificates")
  }

  const handleDownloadSingle = (fileName: string) => {
    // In a real app, this would download a single file
    alert(`In a real implementation, this would download: ${fileName}`)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Download Certificates</h2>
        <p className="text-muted-foreground">Your certificates are ready for download</p>
      </div>

      <div className="bg-primary/5 rounded-lg p-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Download className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {files.length} Certificate{files.length !== 1 ? "s" : ""} Generated
        </h3>
        <p className="text-muted-foreground mb-6">
          All certificates have been successfully generated and are ready for download
        </p>
        <Button size="lg" onClick={handleDownloadAll}>
          <Download className="mr-2 h-5 w-5" />
          Download All as ZIP
        </Button>
      </div>

      {files.length > 0 && (
        <div className="border rounded-md divide-y">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <FileDown className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>{file}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDownloadSingle(file)}>
                Download
              </Button>
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
  )
}
