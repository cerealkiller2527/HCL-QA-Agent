"use client"

import { useState, useCallback, useMemo } from "react"
import { type DragStartEvent, type DragEndEvent, type DragOverEvent } from "@dnd-kit/core"
import { type Dataset } from "@/services/schemas/domain.schema"

interface Collection {
  id: string
  name: string
  description: string
  color: string
  datasetIds: string[]
}

interface UseDatasetsPageReturn {
  // Collections state
  collections: Collection[]
  expandedCollections: Set<string>
  showCollectionModal: boolean
  
  // Drag and drop state
  activeId: string | null
  overId: string | null
  
  // Search and selection state
  searchQuery: string
  selectedDatasets: Set<string>
  isSelectionMode: boolean
  
  // Dialog state
  showDeleteDialog: boolean
  datasetToDelete: string | null
  showMassDeleteDialog: boolean
  
  // Computed values
  uncategorizedDatasets: Dataset[]
  displayedDatasets: Dataset[]
  draggedDataset: Dataset | null
  
  // Collections actions
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>
  createCollection: (collectionData: Omit<Collection, "id" | "datasetIds">) => void
  setShowCollectionModal: React.Dispatch<React.SetStateAction<boolean>>
  toggleCollectionExpansion: (collectionId: string) => void
  removeFromCollection: (collectionId: string, datasetId: string) => void
  
  // Search actions
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  
  // Selection actions
  toggleDatasetSelection: (datasetId: string) => void
  selectAllDatasets: () => void
  clearSelection: () => void
  setIsSelectionMode: React.Dispatch<React.SetStateAction<boolean>>
  
  // Delete actions
  handleDeleteDataset: (datasetId: string) => void
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>
  setDatasetToDelete: React.Dispatch<React.SetStateAction<string | null>>
  setShowMassDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>
  
  // Drag and drop actions
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
}

interface UseDatasetsPageProps {
  datasets: Dataset[]
}

export function useDatasetsPage({ datasets }: UseDatasetsPageProps): UseDatasetsPageReturn {
  // Collections state
  const [collections, setCollections] = useState<Collection[]>([])
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())
  
  // Drag and drop state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  
  // Search and selection state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDatasets, setSelectedDatasets] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  
  // Dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null)
  const [showMassDeleteDialog, setShowMassDeleteDialog] = useState(false)

  // Use empty array if no datasets
  const allDatasets = datasets || []

  // Computed Values
  const uncategorizedDatasets = useMemo(() => {
    return allDatasets.filter((dataset) => !collections.some((collection) => collection.datasetIds.includes(dataset.id)))
  }, [allDatasets, collections])

  const displayedDatasets = useMemo(() => {
    // Since we're already filtering by search in the API call, just return uncategorized datasets
    return uncategorizedDatasets
  }, [uncategorizedDatasets])

  const draggedDataset = useMemo(() => {
    return activeId ? allDatasets.find((d) => d.id === activeId) || null : null
  }, [activeId, allDatasets])

  // Collections Actions
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

  // Selection Actions
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

  const selectAllDatasets = useCallback(() => {
    setSelectedDatasets(new Set(displayedDatasets.map((d) => d.id)))
  }, [displayedDatasets])

  const clearSelection = useCallback(() => {
    setSelectedDatasets(new Set())
    setIsSelectionMode(false)
  }, [])

  // Delete Actions
  const handleDeleteDataset = useCallback((datasetId: string) => {
    setDatasetToDelete(datasetId)
    setShowDeleteDialog(true)
  }, [])

  // Drag and Drop Actions
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

  return {
    // Collections state
    collections,
    expandedCollections,
    showCollectionModal,
    
    // Drag and drop state
    activeId,
    overId,
    
    // Search and selection state
    searchQuery,
    selectedDatasets,
    isSelectionMode,
    
    // Dialog state
    showDeleteDialog,
    datasetToDelete,
    showMassDeleteDialog,
    
    // Computed values
    uncategorizedDatasets,
    displayedDatasets,
    draggedDataset,
    
    // Collections actions
    setCollections,
    createCollection,
    setShowCollectionModal,
    toggleCollectionExpansion,
    removeFromCollection,
    
    // Search actions
    setSearchQuery,
    
    // Selection actions
    toggleDatasetSelection,
    selectAllDatasets,
    clearSelection,
    setIsSelectionMode,
    
    // Delete actions
    handleDeleteDataset,
    setShowDeleteDialog,
    setDatasetToDelete,
    setShowMassDeleteDialog,
    
    // Drag and drop actions
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  }
}