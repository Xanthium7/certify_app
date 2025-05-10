import type { Metadata } from "next"
import CertificateFlow from "@/components/certificate-flow"

export const metadata: Metadata = {
  title: "Certificate Generator",
  description: "Upload, customize, and batch generate certificates",
}

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Certificate Generator</h1>
          <p className="text-muted-foreground">Upload a certificate template, customize it, and generate in batch</p>
        </div>

        <CertificateFlow />
      </div>
    </main>
  )
}
