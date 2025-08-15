"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core"
import { DatasetCard } from "./dataset-card"

interface Dataset {
  id: string
  name: string
  status: string
  robotType: string
  episodes: number
  size: string
  lastModified: string
  description: string
  tags: string[]
}

interface Collection {
  id: string
  name: string
  color: string
  datasets: Dataset[]
}

interface DragDropContextType {
  collections: Collection[]
  uncategorizedDatasets: Dataset[]
  createCollection: (name: string, color: string) => void
  addToCollection: (datasetId: string, collectionId: string) => void
  removeFromCollection: (datasetId: string, collectionId: string) => void
  deleteCollection: (collectionId: string) => void
  updateCollection: (collectionId: string, updates: Partial<Collection>) => void
}

const DragDropContext = createContext<DragDropContextType | null>(null)

export function useDragDrop() {
  const context = useContext(DragDropContext)

  // Return safe defaults if context is not available
  if (!context) {
    return {
      collections: [],
      uncategorizedDatasets: [],
      createCollection: () => {},
      addToCollection: () => {},
      removeFromCollection: () => {},
      deleteCollection: () => {},
      updateCollection: () => {},
    }
  }

  return context
}

interface DragDropProviderProps {
  children: ReactNode
  initialDatasets: Dataset[]
}

export function DragDropProvider({ children, initialDatasets }: DragDropProviderProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [uncategorizedDatasets, setUncategorizedDatasets] = useState<Dataset[]>(initialDatasets)
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const createCollection = (name: string, color: string) => {
    const newCollection: Collection = {
      id: `collection-${Date.now()}`,
      name,
      color,
      datasets: [],
    }
    setCollections((prev) => [...prev, newCollection])
  }

  const addToCollection = (datasetId: string, collectionId: string) => {
    const dataset =
      uncategorizedDatasets.find((d) => d.id === datasetId) ||
      collections.flatMap((c) => c.datasets).find((d) => d.id === datasetId)

    if (!dataset) return

    // Remove from uncategorized or other collections
    setUncategorizedDatasets((prev) => prev.filter((d) => d.id !== datasetId))
    setCollections((prev) =>
      prev.map((c) => ({
        ...c,
        datasets: c.datasets.filter((d) => d.id !== datasetId),
      })),
    )

    // Add to target collection
    setCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, datasets: [...c.datasets, dataset] } : c)),
    )
  }

  const removeFromCollection = (datasetId: string, collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId)
    const dataset = collection?.datasets.find((d) => d.id === datasetId)

    if (!dataset) return

    setCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, datasets: c.datasets.filter((d) => d.id !== datasetId) } : c)),
    )

    setUncategorizedDatasets((prev) => [...prev, dataset])
  }

  const deleteCollection = (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId)
    if (!collection) return

    // Move datasets back to uncategorized
    setUncategorizedDatasets((prev) => [...prev, ...collection.datasets])
    setCollections((prev) => prev.filter((c) => c.id !== collectionId))
  }

  const updateCollection = (collectionId: string, updates: Partial<Collection>) => {
    setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, ...updates } : c)))
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const dataset =
      uncategorizedDatasets.find((d) => d.id === active.id) ||
      collections.flatMap((c) => c.datasets).find((d) => d.id === active.id)
    setActiveDataset(dataset || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDataset(null)

    if (!over) return

    const datasetId = active.id as string
    const overId = over.id as string

    // Check if dropping on a collection
    if (overId.startsWith("collection-")) {
      addToCollection(datasetId, overId)
    }
  }

  const contextValue: DragDropContextType = {
    collections,
    uncategorizedDatasets,
    createCollection,
    addToCollection,
    removeFromCollection,
    deleteCollection,
    updateCollection,
  }

  return (
    <DragDropContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {activeDataset && (
            <div className="rotate-3 opacity-80">
              <DatasetCard dataset={activeDataset} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </DragDropContext.Provider>
  )
}
