import { DatasetViewer } from "@/components/datasets/dataset-viewer"

interface PageParams {
  params: {
    owner: string
    name: string
  }
}

export default function DatasetViewerPage({ params }: PageParams) {
  // Combine owner and name to create the full dataset ID
  const datasetId = `${params.owner}/${params.name}`
  
  return <DatasetViewer datasetId={datasetId} />
}
