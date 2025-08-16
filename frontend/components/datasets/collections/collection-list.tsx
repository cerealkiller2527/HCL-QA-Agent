"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useDroppable } from "@dnd-kit/core"
import {
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  ArrowLeft,
  Trash2,
  MoreHorizontal,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { CustomDropdown } from "@/components/ui/custom-dropdown"
import { cn } from "@/lib/utils"

interface Collection {
  id: string
  name: string
  description: string
  color: string
  datasetIds: string[]
}

interface Dataset {
  id: string
  name: string
  description: string
  fileSize: number
  frameCount: number
}

interface CollectionViewProps {
  collection: Collection
  datasets: Dataset[]
  isExpanded: boolean
  isOver: boolean
  onToggleExpansion: () => void
  onRemoveFromCollection: (datasetId: string) => void
  onDeleteDataset: (datasetId: string) => void
}

interface CollectionListProps {
  collections: Collection[]
  datasets: Dataset[]
  expandedIds: Set<string>
  overId: string | null
  onToggleExpanded: (collectionId: string) => void
  onRemoveFromCollection: (collectionId: string, datasetId: string) => void
  onDeleteDataset: (datasetId: string) => void
}

// Helper function
function formatFileSize(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  if (bytes === 0 || !bytes) return "Size unavailable"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

function CollectionView({
  collection,
  datasets,
  isExpanded,
  isOver,
  onToggleExpansion,
  onRemoveFromCollection,
  onDeleteDataset,
}: CollectionViewProps) {
  const router = useRouter()
  const { setNodeRef } = useDroppable({ id: collection.id })
  
  const collectionDatasets = useMemo(() => {
    return collection.datasetIds.map((id) => datasets.find((d) => d.id === id)).filter(Boolean) as Dataset[]
  }, [collection.datasetIds, datasets])

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border-2 overflow-hidden transition-all duration-200",
        isOver ? "border-primary bg-primary/5 shadow-lg" : "border-border bg-layer-2"
      )}
    >
      {/* Collection Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl ${collection.color} flex items-center justify-center`}>
              {isExpanded ? <FolderOpen className="h-6 w-6 text-white" /> : <Folder className="h-6 w-6 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold font-sans text-lg">{collection.name}</h3>
              <p className="text-sm text-muted-foreground">
                {collection.datasetIds.length} dataset{collection.datasetIds.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggleExpansion}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {collection.description && <p className="text-sm text-muted-foreground mt-3">{collection.description}</p>}

        {/* Collection Preview (when collapsed) */}
        {!isExpanded && collection.datasetIds.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {collection.datasetIds.slice(0, 6).map((datasetId) => {
              const dataset = datasets.find((d) => d.id === datasetId)
              return dataset ? (
                <div
                  key={datasetId}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <div className="w-6 h-6 rounded-md bg-primary/30 flex items-center justify-center text-xs font-mono font-semibold text-primary-foreground">
                    {dataset.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-primary truncate max-w-20">{dataset.name}</span>
                </div>
              ) : null
            })}
            {collection.datasetIds.length > 6 && (
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-muted border border-border">
                <span className="text-xs text-muted-foreground font-semibold">
                  +{collection.datasetIds.length - 6} more
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Collection Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-6 pt-4 space-y-4">
              {collectionDatasets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collectionDatasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className="group relative p-4 bg-background rounded-lg border border-border hover:bg-layer-2 hover:border-primary/30 transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold font-mono text-sm truncate">{dataset.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {dataset.description}
                            </p>
                          </div>
                          <CustomDropdown
                            trigger={
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            }
                            items={[
                              {
                                label: "View Dataset",
                                icon: <Eye className="h-4 w-4" />,
                                onClick: () => router.push(`/datasets/${dataset.id}`),
                              },
                              {
                                label: "Remove from Collection",
                                icon: <ArrowLeft className="h-4 w-4" />,
                                onClick: () => onRemoveFromCollection(dataset.id),
                              },
                              {
                                label: "Delete Dataset",
                                icon: <Trash2 className="h-4 w-4" />,
                                onClick: () => onDeleteDataset(dataset.id),
                                destructive: true,
                                separator: true,
                              },
                            ]}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-mono">{formatFileSize(dataset.fileSize)}</span>
                          <span className="text-muted-foreground font-mono">{(dataset.frameCount || 0).toLocaleString()} frames</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Folder className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No datasets in this collection</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm z-10 pointer-events-none rounded-xl">
          <div className="text-center p-4">
            <Plus className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-primary font-semibold text-sm">Add to collection</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function CollectionList({
  collections,
  datasets,
  expandedIds,
  overId,
  onToggleExpanded,
  onRemoveFromCollection,
  onDeleteDataset,
}: CollectionListProps) {
  if (collections.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="text-title mb-4">Collections</h2>
      <div className="space-y-4">
        {collections.map((collection) => (
          <CollectionView
            key={collection.id}
            collection={collection}
            datasets={datasets}
            isExpanded={expandedIds.has(collection.id)}
            isOver={overId === collection.id}
            onToggleExpansion={() => onToggleExpanded(collection.id)}
            onRemoveFromCollection={(datasetId) => onRemoveFromCollection(collection.id, datasetId)}
            onDeleteDataset={onDeleteDataset}
          />
        ))}
      </div>
    </div>
  )
}