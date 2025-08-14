import { DatasetViewer } from "@/components/datasets/dataset-viewer"

export default function DatasetViewerPage({ params }: { params: { id: string } }) {
  return <DatasetViewer datasetId={params.id} />
}
