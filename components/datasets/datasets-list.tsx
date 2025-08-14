"use client"
import { useState } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, FolderPlus, Folder } from "lucide-react"
import { mockDatasets } from "@/lib/data/mock-datasets"
import { DatasetCard } from "@/components/datasets/dataset-card"
import { DatasetFilters } from "@/components/datasets/dataset-filters"
import { CollectionModal } from "@/components/datasets/collection-modal"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"

interface Collection {
  id: string
  name: string
  description: string
  color: string
  datasetIds: string[]
}

export function DatasetsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [robotTypeFilter, setRobotTypeFilter] = useState<string>("all")
  const [collections, setCollections] = useState<Collection[]>([])
  const [draggedDataset, setDraggedDataset] = useState<string | null>(null)
  const [dragOverCollection, setDragOverCollection] = useState<string | null>(null)
  const [showCollectionModal, setShowCollectionModal] = useState(false)

  const datasets = mockDatasets || []

  // Get datasets that aren't in any collection
  const uncategorizedDatasets = datasets.filter(
    (dataset) => !collections.some((collection) => collection.datasetIds.includes(dataset.id)),
  )

  const filteredDatasets = uncategorizedDatasets.filter((dataset) => {
    const matchesStatus = statusFilter === "all" || dataset.status === statusFilter
    const matchesRobotType = robotTypeFilter === "all" || dataset.robotType === robotTypeFilter

    if (!matchesStatus || !matchesRobotType) return false

    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()
    return (
      dataset.name.toLowerCase().includes(query) ||
      dataset.description.toLowerCase().includes(query) ||
      dataset.tags.some((tag) => tag.toLowerCase().includes(query))
    )
  })

  const clearFilters = () => {
    setStatusFilter("all")
    setRobotTypeFilter("all")
    setSearchQuery("")
  }

  const hasActiveFilters = statusFilter !== "all" || robotTypeFilter !== "all" || searchQuery

  const containerVariants = createStaggerAnimation(0.1)

  const createCollection = (collectionData: Omit<Collection, "id" | "datasetIds">) => {
    const newCollection: Collection = {
      id: Date.now().toString(),
      ...collectionData,
      datasetIds: [],
    }

    setCollections([...collections, newCollection])
  }

  const handleDragStart = (datasetId: string) => {
    setDraggedDataset(datasetId)
  }

  const handleDragEnd = () => {
    setDraggedDataset(null)
    setDragOverCollection(null)
  }

  const handleDragOver = (e: React.DragEvent, collectionId: string) => {
    e.preventDefault()
    setDragOverCollection(collectionId)
  }

  const handleDragLeave = () => {
    setDragOverCollection(null)
  }

  const handleDropOnCollection = (collectionId: string) => {
    if (!draggedDataset) return

    setCollections(
      collections.map((collection) =>
        collection.id === collectionId
          ? { ...collection, datasetIds: [...collection.datasetIds, draggedDataset] }
          : collection,
      ),
    )
    setDraggedDataset(null)
    setDragOverCollection(null)
  }

  const removeFromCollection = (collectionId: string, datasetId: string) => {
    setCollections(
      collections.map((collection) =>
        collection.id === collectionId
          ? { ...collection, datasetIds: collection.datasetIds.filter((id) => id !== datasetId) }
          : collection,
      ),
    )
  }

  return (
    <motion.div className="p-8 space-y-8" variants={containerVariants} initial="initial" animate="animate">
      {/* Header */}
      <motion.div className="flex items-center justify-between" variants={ANIMATION.variants.staggerItem}>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold font-sans">Datasets</h1>
          <p className="text-muted-foreground font-sans">Manage your robotics training data</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="bg-transparent" onClick={() => setShowCollectionModal(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Dataset
          </Button>
        </div>
      </motion.div>

      {/* Collections */}
      {collections.length > 0 && (
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <h2 className="text-lg font-semibold font-sans mb-4">Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {collections.map((collection) => (
              <motion.div
                key={collection.id}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  dragOverCollection === collection.id
                    ? "border-primary bg-primary/10 scale-105 shadow-lg"
                    : draggedDataset
                      ? "border-dashed border-primary/50 bg-primary/5"
                      : "border-border bg-layer-2 hover:bg-layer-3"
                }`}
                onDragOver={(e) => handleDragOver(e, collection.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDropOnCollection(collection.id)}
                whileHover={{ scale: draggedDataset ? 1.05 : 1.02 }}
                layout
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${collection.color} flex items-center justify-center shadow-sm`}
                  >
                    <Folder className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold font-sans truncate">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {collection.datasetIds.length} dataset{collection.datasetIds.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {collection.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{collection.description}</p>
                )}

                {/* Preview of datasets in collection */}
                <div className="space-y-2">
                  {collection.datasetIds.slice(0, 3).map((datasetId) => {
                    const dataset = datasets.find((d) => d.id === datasetId)
                    return dataset ? (
                      <div
                        key={datasetId}
                        className="flex items-center justify-between p-2 bg-background rounded-lg border group hover:bg-layer-2 transition-colors"
                      >
                        <span className="text-sm font-mono truncate flex-1">{dataset.name}</span>
                        <button
                          onClick={() => removeFromCollection(collection.id, datasetId)}
                          className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ) : null
                  })}
                  {collection.datasetIds.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{collection.datasetIds.length - 3} more
                    </div>
                  )}
                </div>

                {/* Drop overlay */}
                {dragOverCollection === collection.id && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-xl backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                        <Plus className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-primary font-semibold">Drop to add</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <DatasetFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        robotTypeFilter={robotTypeFilter}
        setRobotTypeFilter={setRobotTypeFilter}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
        resultsCount={filteredDatasets.length}
      />

      {/* Datasets Grid */}
      {filteredDatasets.length > 0 ? (
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" variants={containerVariants}>
            {filteredDatasets.map((dataset) => (
              <motion.div
                key={dataset.id}
                draggable
                onDragStart={() => handleDragStart(dataset.id)}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-300 cursor-grab active:cursor-grabbing ${
                  draggedDataset === dataset.id ? "opacity-60 scale-95 rotate-2" : "hover:scale-105"
                }`}
                whileDrag={{ scale: 0.95, rotate: 5 }}
                layout
              >
                <DatasetCard dataset={dataset} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div className="text-center py-16" variants={ANIMATION.variants.staggerItem}>
          <div className="mx-auto w-24 h-24 bg-layer-2 rounded-full flex items-center justify-center mb-6">
            <FolderPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold font-sans mb-2">No datasets found</h3>
          <p className="text-muted-foreground mb-6 font-sans max-w-md mx-auto">
            {hasActiveFilters
              ? "Try adjusting your filters to see more results"
              : "Get started by creating your first dataset"}
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
    </motion.div>
  )
}
