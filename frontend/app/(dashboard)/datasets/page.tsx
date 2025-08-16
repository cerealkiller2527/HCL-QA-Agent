"use client"

import { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  FolderPlus,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  ArrowLeft,
  Trash2,
  MoreHorizontal,
  X,
  MousePointer2,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  closestCenter,
} from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { useRouter } from "next/navigation"

// Components
import { DatasetCard } from "@/components/datasets/common/dataset-card"
import { CollectionModal } from "@/components/datasets/collections/collection-modal"
import { CustomDropdown } from "@/components/ui/custom-dropdown"

// Data & Utils
import { useDatasets } from "@/lib/hooks/use-datasets"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"
import { cn } from "@/lib/utils"

// Import shared utilities
import { formatFileSize } from "@/lib/utils/format"

interface Collection {
  id: string
  name: string
  description: string
  color: string
  datasetIds: string[]
}

// Draggable Dataset Component
function DraggableDataset({
  dataset,
  isSelectionMode,
  selectedDatasets,
  toggleDatasetSelection,
  handleDeleteDataset,
}: {
  dataset: any
  isSelectionMode: boolean
  selectedDatasets: Set<string>
  toggleDatasetSelection: (id: string) => void
  handleDeleteDataset: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dataset.id,
    disabled: isSelectionMode,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${
        isSelectionMode ? "" : "cursor-grab active:cursor-grabbing"
      } ${isDragging ? "opacity-60" : ""} transition-opacity duration-200`}
      {...(isSelectionMode ? {} : listeners)}
      {...(isSelectionMode ? {} : attributes)}
    >
      <DatasetCard 
        dataset={dataset} 
        onDelete={() => handleDeleteDataset(dataset.id)}
        showDeleteButton={!isSelectionMode}
        isSelectionMode={isSelectionMode}
        isSelected={selectedDatasets.has(dataset.id)}
        onSelect={() => toggleDatasetSelection(dataset.id)}
      />
    </div>
  )
}

// Collection Component
function CollectionView({
  collection,
  datasets,
  isExpanded,
  isOver,
  onToggleExpansion,
  onRemoveFromCollection,
  onDeleteDataset,
}: {
  collection: Collection
  datasets: any[]
  isExpanded: boolean
  isOver: boolean
  onToggleExpansion: () => void
  onRemoveFromCollection: (datasetId: string) => void
  onDeleteDataset: (datasetId: string) => void
}) {
  const router = useRouter()
  const { setNodeRef } = useDroppable({ id: collection.id })
  
  const collectionDatasets = useMemo(() => {
    return collection.datasetIds.map((id) => datasets.find((d) => d.id === id)).filter(Boolean)
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

export default function DatasetsPage() {
  const router = useRouter()
  
  // State Management
  const [collections, setCollections] = useState<Collection[]>([])
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDatasets, setSelectedDatasets] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null)
  const [showMassDeleteDialog, setShowMassDeleteDialog] = useState(false)

  // Fetch datasets from API
  const { data: datasets, loading, error, refetch } = useDatasets({
    search: searchQuery || undefined
  })
  
  // Use empty array if no data yet
  const allDatasets = datasets || []

  // Computed Values
  const uncategorizedDatasets = useMemo(() => {
    return allDatasets.filter((dataset) => !collections.some((collection) => collection.datasetIds.includes(dataset.id)))
  }, [allDatasets, collections])

  const displayedDatasets = useMemo(() => {
    // Since we're already filtering by search in the API call, just return uncategorized datasets
    return uncategorizedDatasets
  }, [uncategorizedDatasets])

  // Drag and Drop Setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  )

  // Handlers
  const createCollection = useCallback((collectionData: Omit<Collection, "id" | "datasetIds">) => {
    const newCollection: Collection = {
      id: Date.now().toString(),
      ...collectionData,
      datasetIds: [],
    }
    setCollections((prev) => [...prev, newCollection])
  }, [])

  const toggleCollectionExpansion = useCallback((collectionId: string) => {
    setExpandedCollections((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(collectionId)) {
        newExpanded.delete(collectionId)
      } else {
        newExpanded.add(collectionId)
      }
      return newExpanded
    })
  }, [])

  const removeFromCollection = useCallback((collectionId: string, datasetId: string) => {
    setCollections((prevCollections) =>
      prevCollections.map((collection) =>
        collection.id === collectionId
          ? { ...collection, datasetIds: collection.datasetIds.filter((id) => id !== datasetId) }
          : collection
      )
    )
  }, [])

  const toggleDatasetSelection = useCallback((datasetId: string) => {
    setSelectedDatasets((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(datasetId)) {
        newSelected.delete(datasetId)
      } else {
        newSelected.add(datasetId)
      }
      return newSelected
    })
  }, [])

  const handleDeleteDataset = useCallback((datasetId: string) => {
    setDatasetToDelete(datasetId)
    setShowDeleteDialog(true)
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    setOverId(over ? (over.id as string) : null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        const datasetId = active.id as string
        const collectionId = over.id as string
        const targetCollection = collections.find((c) => c.id === collectionId)
        if (targetCollection) {
          setCollections((prevCollections) =>
            prevCollections.map((collection) =>
              collection.id === collectionId
                ? { ...collection, datasetIds: [...new Set([...collection.datasetIds, datasetId])] }
                : collection
            )
          )
        }
      }
      setActiveId(null)
      setOverId(null)
    },
    [collections]
  )

  const draggedDataset = useMemo(() => {
    return activeId ? allDatasets.find((d) => d.id === activeId) : null
  }, [activeId, allDatasets])

  const selectAllDatasets = useCallback(() => {
    setSelectedDatasets(new Set(displayedDatasets.map((d) => d.id)))
  }, [displayedDatasets])

  const clearSelection = useCallback(() => {
    setSelectedDatasets(new Set())
    setIsSelectionMode(false)
  }, [])

  const confirmDeleteDataset = useCallback(async () => {
    if (datasetToDelete) {
      try {
        // Import the API client
        const { datasetsApi } = await import('@/lib/api/datasets.api')
        
        // Delete from HuggingFace using validated API
        await datasetsApi.delete(datasetToDelete)
        
        // Remove from collections
        setCollections((prev) =>
          prev.map((collection) => ({
            ...collection,
            datasetIds: collection.datasetIds.filter((id) => id !== datasetToDelete),
          }))
        )
        
        // Refresh the datasets list to reflect changes
        refetch()
        
        // Show success message to user
        console.log(`Successfully deleted dataset: ${datasetToDelete}`)
        // Could add a toast notification here in the future
        
      } catch (error) {
        console.error(`Failed to delete dataset: ${error}`)
        // Show user-friendly error message
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to delete dataset: ${errorMessage}`)
      }
    }
    setDatasetToDelete(null)
    setShowDeleteDialog(false)
  }, [datasetToDelete, refetch])

  const confirmMassDelete = useCallback(async () => {
    try {
      // Import the API client
      const { datasetsApi } = await import('@/lib/api/datasets.api')
      
      // Convert Set to Array for batch deletion
      const datasetIds = Array.from(selectedDatasets);
      
      // Use efficient batch delete method with detailed error reporting
      const results = await datasetsApi.deleteMultiple(datasetIds)
      
      if (results.success.length > 0) {
        // Remove successfully deleted datasets from collections
        setCollections((prev) =>
          prev.map((collection) => ({
            ...collection,
            datasetIds: collection.datasetIds.filter((id) => !results.success.includes(id)),
          }))
        )
        
        // Refresh the datasets list to reflect changes
        refetch()
        
        console.log(`Successfully deleted ${results.success.length} datasets:`, results.success)
      }
      
      // Show detailed results to user
      if (results.failed.length > 0) {
        const failedList = results.failed.map(f => `${f.id}: ${f.error}`).join('\n');
        alert(`${results.success.length} datasets deleted successfully.\n\nFailed to delete ${results.failed.length} datasets:\n${failedList}`);
      } else if (results.success.length > 0) {
        alert(`Successfully deleted all ${results.success.length} selected datasets.`);
      } else {
        alert('No datasets were deleted. Please check permissions and try again.');
      }
    } catch (error) {
      console.error(`Failed to delete datasets:`, error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to delete datasets: ${errorMessage}`)
    }
    
    clearSelection()
    setShowMassDeleteDialog(false)
  }, [selectedDatasets, clearSelection, refetch])

  const containerVariants = createStaggerAnimation(0.1)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <motion.div className="p-8 space-y-8" variants={containerVariants} initial="initial" animate="animate">
        {/* Header */}
        <motion.div className="flex items-center justify-between" variants={ANIMATION.variants.staggerItem}>
          <div className="space-y-1">
            <h1 className="text-display">Datasets</h1>
            <p className="text-body text-muted-foreground">Manage your robotics training data</p>
          </div>
          <div className="flex space-x-3">
            {isSelectionMode ? (
              <div className="flex items-center space-x-2">
                <span className="text-caption text-muted-foreground">{selectedDatasets.size} selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllDatasets}
                  disabled={selectedDatasets.size === displayedDatasets.length}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMassDeleteDialog(true)}
                  disabled={selectedDatasets.size === 0}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete ({selectedDatasets.size})
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsSelectionMode(true)}>
                  Select
                </Button>
                <Button variant="outline" onClick={() => setShowCollectionModal(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Collection
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Dataset
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div className="flex items-center space-x-4" variants={ANIMATION.variants.staggerItem}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchQuery && (
            <div className="text-caption text-muted-foreground">
              {displayedDatasets.length} of {uncategorizedDatasets.length} datasets
            </div>
          )}
        </motion.div>

        {/* Drag and Drop Instructions */}
        {!isSelectionMode && collections.length > 0 && displayedDatasets.length > 0 && (
          <motion.div
            className="flex items-center space-x-2 p-4 bg-primary/5 border border-primary/20 rounded-lg"
            variants={ANIMATION.variants.staggerItem}
          >
            <MousePointer2 className="h-4 w-4 text-primary" />
            <p className="text-caption text-primary">Drag and drop datasets onto collections to organize them</p>
          </motion.div>
        )}

        {/* Collections */}
        {collections.length > 0 && (
          <motion.div variants={ANIMATION.variants.staggerItem}>
            <h2 className="text-title mb-4">Collections</h2>
            <div className="space-y-4">
              {collections.map((collection) => (
                <CollectionView
                  key={collection.id}
                  collection={collection}
                  datasets={allDatasets}
                  isExpanded={expandedCollections.has(collection.id)}
                  isOver={overId === collection.id}
                  onToggleExpansion={() => toggleCollectionExpansion(collection.id)}
                  onRemoveFromCollection={(datasetId) => removeFromCollection(collection.id, datasetId)}
                  onDeleteDataset={handleDeleteDataset}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Datasets Grid */}
        {loading ? (
          <motion.div className="text-center py-16" variants={ANIMATION.variants.staggerItem}>
            <div className="mx-auto w-24 h-24 bg-layer-2 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            </div>
            <h3 className="text-title mb-2">Loading datasets...</h3>
            <p className="text-body text-muted-foreground">Fetching your datasets from HuggingFace</p>
          </motion.div>
        ) : error ? (
          <motion.div className="text-center py-16" variants={ANIMATION.variants.staggerItem}>
            <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-title mb-2">Failed to load datasets</h3>
            <p className="text-body text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </motion.div>
        ) : displayedDatasets.length > 0 ? (
          <motion.div variants={ANIMATION.variants.staggerItem}>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" variants={containerVariants}>
              {displayedDatasets.map((dataset) => (
                <DraggableDataset
                  key={dataset.id}
                  dataset={dataset}
                  isSelectionMode={isSelectionMode}
                  selectedDatasets={selectedDatasets}
                  toggleDatasetSelection={toggleDatasetSelection}
                  handleDeleteDataset={handleDeleteDataset}
                />
              ))}
            </motion.div>
          </motion.div>
        ) : searchQuery ? (
          <motion.div className="text-center py-16" variants={ANIMATION.variants.staggerItem}>
            <div className="mx-auto w-24 h-24 bg-layer-2 rounded-full flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-title mb-2">No datasets found</h3>
            <p className="text-body text-muted-foreground mb-6 max-w-md mx-auto">
              No datasets match your search for "{searchQuery}". Try adjusting your search terms.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </motion.div>
        ) : (
          <motion.div className="text-center py-16" variants={ANIMATION.variants.staggerItem}>
            <div className="mx-auto w-24 h-24 bg-layer-2 rounded-full flex items-center justify-center mb-6">
              <FolderPlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-title mb-2">No datasets found</h3>
            <p className="text-body text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first dataset
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Dataset
            </Button>
          </motion.div>
        )}

        {/* Collection Modal */}
        <CollectionModal
          open={showCollectionModal}
          onOpenChange={setShowCollectionModal}
          onCreateCollection={createCollection}
        />

        {/* Delete Dialogs */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>⚠️ Delete Dataset from HuggingFace</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  <strong>WARNING:</strong> This will permanently delete the dataset from HuggingFace Hub.
                </p>
                <p>
                  This action cannot be undone and will remove all data, including:
                </p>
                <ul className="list-disc list-inside text-sm mt-2">
                  <li>All dataset files and episodes</li>
                  <li>All metadata and configurations</li>
                  <li>The entire repository from HuggingFace</li>
                </ul>
                <p className="text-red-600 font-semibold mt-2">
                  Are you absolutely sure you want to proceed?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteDataset} className="bg-red-600 hover:bg-red-700">
                Delete Dataset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showMassDeleteDialog} onOpenChange={setShowMassDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Multiple Datasets</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedDatasets.size} dataset{selectedDatasets.size !== 1 ? "s" : ""}?
                This action cannot be undone and will permanently remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmMassDelete} className="bg-red-600 hover:bg-red-700">
                Delete {selectedDatasets.size} Dataset{selectedDatasets.size !== 1 ? "s" : ""}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      <DragOverlay>
        {draggedDataset ? (
          <div style={{ transform: "translate3d(0,0,0) rotate(2deg) scale(1.05)", opacity: 0.9 }}>
            <DatasetCard dataset={draggedDataset} showDeleteButton={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}