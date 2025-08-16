"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { AlertTriangle, RefreshCw, ArrowLeft, Database, FolderOpen } from "lucide-react"
import Link from "next/link"

interface DatasetViewerErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DatasetViewerError({ error, reset }: DatasetViewerErrorProps) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error("Dataset viewer error:", error)
  }, [error])

  // Extract dataset ID from URL if possible
  const datasetId = typeof window !== "undefined" 
    ? window.location.pathname.split("/").pop() || "Unknown Dataset"
    : "Unknown Dataset"

  const breadcrumbItems = [
    {
      label: "Datasets",
      href: "/datasets",
      icon: <FolderOpen className="h-4 w-4" />
    },
    {
      label: decodeURIComponent(datasetId),
      icon: <Database className="h-4 w-4" />
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Error Content */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Dataset Loading Failed</CardTitle>
            <CardDescription>
              We encountered an error while loading the dataset viewer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Details */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Error Details:</h4>
              <p className="text-sm text-muted-foreground break-words">
                {error.message || "An unexpected error occurred while loading the dataset"}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/datasets">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Datasets
                </Link>
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                If this problem persists, please check if the dataset ID is correct
                or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}