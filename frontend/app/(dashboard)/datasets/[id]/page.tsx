import { Metadata } from "next"
import { notFound } from "next/navigation"
import { DatasetViewer } from "@/components/datasets/dataset-viewer"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Suspense } from "react"
import { Loader2, Database, FolderOpen } from "lucide-react"

interface DatasetViewerPageProps {
  params: { id: string }
}

// Generate metadata for the page
export async function generateMetadata({ params }: DatasetViewerPageProps): Promise<Metadata> {
  const datasetId = decodeURIComponent(params.id)
  
  return {
    title: `Dataset: ${datasetId} | LeRobot Platform`,
    description: `View and analyze dataset ${datasetId} with interactive telemetry and video playback`,
    openGraph: {
      title: `Dataset: ${datasetId}`,
      description: `Interactive dataset viewer for ${datasetId}`,
      type: "website",
    },
  }
}

// Loading component for the dataset viewer
function DatasetViewerLoading() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <h3 className="text-lg font-semibold">Loading Dataset Viewer</h3>
        <p className="text-muted-foreground">Fetching dataset information and episodes...</p>
      </div>
    </div>
  )
}

// Error fallback component
function DatasetViewerError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-4 max-w-md">
        <h3 className="text-lg font-semibold text-destructive">Dataset Loading Error</h3>
        <p className="text-muted-foreground">
          {error.message || "Failed to load the dataset. Please try again."}
        </p>
        <button 
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

export default function DatasetViewerPage({ params }: DatasetViewerPageProps) {
  // Validate and decode the dataset ID
  const datasetId = decodeURIComponent(params.id)
  
  // Basic validation for dataset ID format
  if (!datasetId || datasetId.trim() === "") {
    notFound()
  }

  // Prepare breadcrumb items
  const breadcrumbItems = [
    {
      label: "Datasets",
      href: "/datasets",
      icon: <FolderOpen className="h-4 w-4" />
    },
    {
      label: datasetId,
      icon: <Database className="h-4 w-4" />
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Dataset Viewer Content */}
      <ErrorBoundary fallback={DatasetViewerError}>
        <Suspense fallback={<DatasetViewerLoading />}>
          <DatasetViewer datasetId={datasetId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
