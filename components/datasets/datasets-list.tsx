"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, FolderPlus, Folder } from "lucide-react"
import { mockDatasets } from "@/lib/data/mock-datasets"
import { DatasetCard } from "@/components/datasets/dataset-card"
import { DatasetFilters } from "@/components/datasets/dataset-filters"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"

interface Collection {
  id: string
  name: string
  color: string
  datasetIds: string[]
}

export function DatasetsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [robotTypeFilter, setRobotTypeFilter] = useState<string>("all")
  const [collections, setCollections] = useState<Collection[]>([])
  const [draggedDataset, setDraggedDataset] = useState<string | null>(null)
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")

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

  const createCollection = () => {
    if (!newCollectionName.trim()) return

    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"]
    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName,
      color: colors[collections.length % colors.length],
      datasetIds: [],
    }

    setCollections([...collections, newCollection])
    setNewCollectionName("")
    setShowNewCollectionForm(false)
  }

  const handleDragStart = (datasetId: string) => {
    setDraggedDataset(datasetId)
  }

  const handleDragEnd = () => {
    setDraggedDataset(null)
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
          <Button variant="outline" className="bg-transparent" onClick={() => setShowNewCollectionForm(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Dataset
          </Button>
        </div>
      </motion.div>

      {/* New Collection Form */}
      {showNewCollectionForm && (
        <motion.div
          className="bg-layer-2 p-4 rounded-lg border"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Collection name..."
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border rounded-md"
              onKeyDown={(e) => e.key === "Enter" && createCollection()}
              autoFocus
            />
            <Button onClick={createCollection} size="sm">
              Create
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowNewCollectionForm(false)
                setNewCollectionName("")
              }}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <h2 className="text-lg font-semibold font-sans mb-4">Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {collections.map((collection) => (
              <motion.div
                key={collection.id}
                className={`relative p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
                  draggedDataset ? "border-primary bg-primary/5 scale-105" : "border-border bg-layer-2"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnCollection(collection.id)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${collection.color} flex items-center justify-center`}>
                    <Folder className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-sans">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {collection.datasetIds.length} dataset{collection.datasetIds.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Preview of datasets in collection */}
                <div className="grid grid-cols-2 gap-1">
                  {collection.datasetIds.slice(0, 4).map((datasetId) => {
                    const dataset = datasets.find((d) => d.id === datasetId)
                    return dataset ? (
                      <div
                        key={datasetId}
                        className="aspect-square bg-background rounded border text-xs p-1 flex items-center justify-center relative group"
                      >
                        <span className="truncate">{dataset.name}</span>
                        <button
                          onClick={() => removeFromCollection(collection.id, datasetId)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ) : null
                  })}
                </div>

                {draggedDataset && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg">
                    <p className="text-primary font-semibold">Drop here</p>
                  </div>
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
              <div
                key={dataset.id}
                draggable
                onDragStart={() => handleDragStart(dataset.id)}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-200 ${draggedDataset === dataset.id ? "opacity-50 scale-95" : ""}`}
              >
                <DatasetCard dataset={dataset} />
              </div>
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
    </motion.div>
  )
}
