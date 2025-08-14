"use client"
import { useState } from "react"
import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, FolderPlus, Folder, FolderOpen, Search, ChevronDown, ChevronRight, Eye, ArrowLeft } from "lucide-react"
import { mockDatasets } from "@/lib/data/mock-datasets"
import { DatasetCard } from "@/components/datasets/dataset-card"
import { DatasetFilters } from "@/components/datasets/dataset-filters"
import { CollectionModal } from "@/components/datasets/collection-modal"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"
import { useRouter } from "next/navigation"

interface Collection {
  id: string
  name: string
  description: string
  color: string
  datasetIds: string[]
}

export function DatasetsList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [robotTypeFilter, setRobotTypeFilter] = useState<string>("all")
  const [collections, setCollections] = useState<Collection[]>([])
  const [draggedDataset, setDraggedDataset] = useState<string | null>(null)
  const [dragOverCollection, setDragOverCollection] = useState<string | null>(null)
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())
  const [collectionSearchQueries, setCollectionSearchQueries] = useState<Record<string, string>>({})
  const [dragHoverTimeout, setDragHoverTimeout] = useState<NodeJS.Timeout | null>(null)

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

  const toggleCollectionExpansion = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections)
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId)
    } else {
      newExpanded.add(collectionId)
    }
    setExpandedCollections(newExpanded)
  }

  const handleDragStart = (datasetId: string) => {
    setDraggedDataset(datasetId)
  }

  const handleDragEnd = () => {
    setDraggedDataset(null)
    setDragOverCollection(null)
    if (dragHoverTimeout) {
      clearTimeout(dragHoverTimeout)
      setDragHoverTimeout(null)
    }
  }

  const handleDragOver = (e: React.DragEvent, collectionId: string) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const dragX = e.clientX
    const dragY = e.clientY

    const isOverCollection =
      dragX >= rect.left - 20 && dragX <= rect.right + 20 && dragY >= rect.top - 20 && dragY <= rect.bottom + 20

    if (isOverCollection) {
      setDragOverCollection(collectionId)

      if (!expandedCollections.has(collectionId)) {
        if (dragHoverTimeout) clearTimeout(dragHoverTimeout)
        const timeout = setTimeout(() => {
          setExpandedCollections((prev) => new Set([...prev, collectionId]))
        }, 600)
        setDragHoverTimeout(timeout)
      }
    }
  }

  const handleDragLeave = () => {
    setDragOverCollection(null)
    if (dragHoverTimeout) {
      clearTimeout(dragHoverTimeout)
      setDragHoverTimeout(null)
    }
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

  const getFilteredCollectionDatasets = (collection: Collection) => {
    const collectionDatasets = collection.datasetIds
      .map((id) => datasets.find((d) => d.id === id))
      .filter(Boolean) as typeof datasets

    const searchQuery = collectionSearchQueries[collection.id] || ""
    if (!searchQuery.trim()) return collectionDatasets

    const query = searchQuery.toLowerCase()
    return collectionDatasets.filter(
      (dataset) =>
        dataset.name.toLowerCase().includes(query) ||
        dataset.description.toLowerCase().includes(query) ||
        dataset.tags.some((tag) => tag.toLowerCase().includes(query)),
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
          <div className="space-y-4">
            {collections.map((collection) => {
              const isExpanded = expandedCollections.has(collection.id)
              const filteredDatasets = getFilteredCollectionDatasets(collection)

              return (
                <motion.div
                  key={collection.id}
                  className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                    dragOverCollection === collection.id
                      ? "border-primary bg-primary/10 shadow-lg"
                      : draggedDataset
                        ? "border-dashed border-primary/50 bg-primary/5"
                        : "border-border bg-layer-2 hover:bg-layer-3"
                  }`}
                  onDragOver={(e) => handleDragOver(e, collection.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDropOnCollection(collection.id)}
                  layout
                >
                  {/* Collection Header */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-xl ${collection.color} flex items-center justify-center shadow-sm transition-all duration-300`}
                        >
                          {dragOverCollection === collection.id || isExpanded ? (
                            <FolderOpen className="h-6 w-6 text-white" />
                          ) : (
                            <Folder className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold font-sans text-lg">{collection.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {collection.datasetIds.length} dataset{collection.datasetIds.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCollectionExpansion(collection.id)}
                        className="hover:bg-layer-3"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>

                    {collection.description && (
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{collection.description}</p>
                    )}

                    {/* Collection Preview (when collapsed) */}
                    {!isExpanded && collection.datasetIds.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {collection.datasetIds.slice(0, 6).map((datasetId, index) => {
                          const dataset = datasets.find((d) => d.id === datasetId)
                          return dataset ? (
                            <div
                              key={datasetId}
                              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/20 hover:from-primary/20 hover:to-primary/30 transition-all duration-200"
                            >
                              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary/30 to-primary/50 flex items-center justify-center text-xs font-mono font-semibold text-primary-foreground">
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
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-t border-border"
                      >
                        <div className="p-6 pt-4 space-y-4">
                          {/* Search within collection */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder={`Search in ${collection.name}...`}
                              value={collectionSearchQueries[collection.id] || ""}
                              onChange={(e) =>
                                setCollectionSearchQueries((prev) => ({
                                  ...prev,
                                  [collection.id]: e.target.value,
                                }))
                              }
                              className="pl-10 bg-background border-border"
                            />
                          </div>

                          {/* Datasets in collection */}
                          {filteredDatasets.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {filteredDatasets.map((dataset) => (
                                <motion.div
                                  key={dataset.id}
                                  className="group relative p-3 bg-background rounded-lg border border-border hover:bg-layer-2 hover:border-primary/30 transition-all duration-200 hover:shadow-sm"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold font-mono text-sm truncate">{dataset.name}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                          {dataset.description}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => router.push(`/datasets/${dataset.id}`)}
                                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:border-primary/30"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => removeFromCollection(collection.id, dataset.id)}
                                          className="h-7 w-7 p-0 hover:bg-red-50 hover:border-red-200"
                                          title="Remove from collection"
                                        >
                                          <ArrowLeft className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                      <div className="flex items-center space-x-2">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            dataset.status === "active"
                                              ? "bg-green-100 text-green-800"
                                              : dataset.status === "processing"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {dataset.status}
                                        </span>
                                        <span className="text-muted-foreground font-mono">{dataset.size}</span>
                                      </div>
                                      <span className="text-muted-foreground font-mono">{dataset.robotType}</span>
                                    </div>

                                    {dataset.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {dataset.tags.slice(0, 3).map((tag) => (
                                          <span
                                            key={tag}
                                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary font-medium"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                        {dataset.tags.length > 3 && (
                                          <span className="text-xs text-muted-foreground">
                                            +{dataset.tags.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                <Search className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {collectionSearchQueries[collection.id]
                                  ? "No datasets match your search"
                                  : "No datasets in this collection"}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Drop overlay */}
                  {dragOverCollection === collection.id && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Plus className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-primary font-semibold text-lg">Drop to add to collection</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
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
                  draggedDataset === dataset.id ? "opacity-60 scale-95 rotate-2 z-50" : "hover:scale-[1.02]"
                }`}
                whileDrag={{ scale: 0.95, rotate: 5, zIndex: 50 }}
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
