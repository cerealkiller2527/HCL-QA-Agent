"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type Dataset } from '@/services/schemas/domain.schema'
import {
  Plus,
  FolderPlus,
  Trash2,
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
  closestCenter,
} from "@dnd-kit/core"
import { useDraggable } from "@dnd-kit/core"

// Components
import { DatasetCard } from "@/components/datasets/dataset-card"
import { CollectionModal } from "@/components/datasets/collections/collection-modal"
import { CollectionList } from "@/components/datasets/collections/collection-list"

// TanStack Query & Services
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { datasetsApi } from '@/services/api/datasets.api'
import { queryKeys } from '@/services/utils/queryKeys'
import { formatErrorForUser } from '@/services/utils/errorHandler'

// Hooks & Utils
import { useDatasetsPage } from "@/components/datasets/hooks/use-datasets-page"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"

// Draggable Dataset Component
interface DraggableDatasetProps {
  dataset: Dataset
  isSelectionMode: boolean
  selectedDatasets: Set<string>
  toggleDatasetSelection: (id: string) => void
  handleDeleteDataset: (id: string) => void
}

function DraggableDataset({
  dataset,
  isSelectionMode,
  selectedDatasets,
  toggleDatasetSelection,
  handleDeleteDataset,
}: DraggableDatasetProps) {
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

export default function DatasetsPage() {
  const queryClient = useQueryClient()
  
  // Fetch datasets using TanStack Query
  const { 
    data: datasetsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: queryKeys.datasets.list({}),
    queryFn: () => datasetsApi.fetchDatasets(),
  })
  
  const datasets = datasetsResponse?.data || []
  const loading = isLoading
  
  // Use the datasets page hook for state management
  const {
    collections,
    expandedCollections,
    showCollectionModal,
    activeId,
    overId,
    searchQuery,
    selectedDatasets,
    isSelectionMode,
    showDeleteDialog,
    datasetToDelete,
    showMassDeleteDialog,
    uncategorizedDatasets,
    displayedDatasets,
    draggedDataset,
    setCollections,
    createCollection,
    setShowCollectionModal,
    toggleCollectionExpansion,
    removeFromCollection,
    setSearchQuery,
    toggleDatasetSelection,
    selectAllDatasets,
    clearSelection,
    setIsSelectionMode,
    handleDeleteDataset,
    setShowDeleteDialog,
    setDatasetToDelete,
    setShowMassDeleteDialog,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDatasetsPage({ datasets: datasets || [] })

  // Drag and Drop Setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  )

  // Delete mutation with TanStack Query
  const deleteMutation = useMutation({
    mutationFn: (datasetId: string) => datasetsApi.deleteDataset(datasetId),
    onMutate: async (datasetId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.datasets.lists() })
      
      // Snapshot the previous value
      const previousDatasets = queryClient.getQueryData(queryKeys.datasets.list({}))
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.datasets.list({}), (old: unknown) => {
        if (!old || typeof old !== 'object') return old
        const typedOld = old as { data: Dataset[] }
        return {
          ...typedOld,
          data: typedOld.data.filter((dataset: Dataset) => dataset.id !== datasetId)
        }
      })
      
      return { previousDatasets }
    },
    onError: (err, datasetId, context) => {
      // Rollback on error
      if (context?.previousDatasets) {
        queryClient.setQueryData(queryKeys.datasets.list({}), context.previousDatasets)
      }
      alert(`Failed to delete dataset: ${formatErrorForUser(err)}`)
    },
    onSuccess: (_, datasetId) => {
      // Remove from collections
      setCollections((prev) =>
        prev.map((collection) => ({
          ...collection,
          datasetIds: collection.datasetIds.filter((id) => id !== datasetId),
        }))
      )
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.lists() })
    },
  })
  
  // Delete confirmation handlers
  const confirmDeleteDataset = async () => {
    if (datasetToDelete) {
      deleteMutation.mutate(datasetToDelete)
    }
    setDatasetToDelete(null)
    setShowDeleteDialog(false)
  }

  // Mass delete mutation
  const massDeleteMutation = useMutation({
    mutationFn: async (datasetIds: string[]) => {
      const results = await Promise.allSettled(
        datasetIds.map(id => datasetsApi.deleteDataset(id))
      )
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      return { successful, failed, total: datasetIds.length }
    },
    onMutate: async (datasetIds) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.datasets.lists() })
      const previousDatasets = queryClient.getQueryData(queryKeys.datasets.list({}))
      
      // Optimistically remove all selected datasets
      queryClient.setQueryData(queryKeys.datasets.list({}), (old: unknown) => {
        if (!old || typeof old !== 'object') return old
        const typedOld = old as { data: Dataset[] }
        return {
          ...typedOld,
          data: typedOld.data.filter((dataset: Dataset) => !datasetIds.includes(dataset.id))
        }
      })
      
      return { previousDatasets }
    },
    onError: (err, datasetIds, context) => {
      if (context?.previousDatasets) {
        queryClient.setQueryData(queryKeys.datasets.list({}), context.previousDatasets)
      }
      alert(`Failed to delete datasets: ${formatErrorForUser(err)}`)
    },
    onSuccess: (result, datasetIds) => {
      // Remove from collections
      setCollections((prev) =>
        prev.map((collection) => ({
          ...collection,
          datasetIds: collection.datasetIds.filter((id) => !selectedDatasets.has(id)),
        }))
      )
      
      if (result.failed > 0) {
        alert(`${result.successful} out of ${result.total} datasets deleted successfully. ${result.failed} failed.`)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets.lists() })
    },
  })
  
  const confirmMassDelete = async () => {
    const datasetIds = Array.from(selectedDatasets)
    massDeleteMutation.mutate(datasetIds)
    clearSelection()
    setShowMassDeleteDialog(false)
  }

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
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <CollectionList
            collections={collections}
            datasets={datasets || []}
            expandedIds={expandedCollections}
            overId={overId}
            onToggleExpanded={toggleCollectionExpansion}
            onRemoveFromCollection={removeFromCollection}
            onDeleteDataset={handleDeleteDataset}
          />
        </motion.div>

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
            <p className="text-body text-muted-foreground mb-6 max-w-md mx-auto">{formatErrorForUser(error)}</p>
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
                Are you sure you want to delete {selectedDatasets.size} dataset{selectedDatasets.size !== 1 ? 's' : ''}?
                This action cannot be undone and will permanently remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmMassDelete} className="bg-red-600 hover:bg-red-700">
                Delete {selectedDatasets.size} Dataset{selectedDatasets.size !== 1 ? 's' : ''}
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