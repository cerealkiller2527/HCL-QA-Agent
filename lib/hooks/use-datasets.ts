"use client"

import { useState, useEffect, useCallback } from "react"
import { datasetService, type DatasetFilters } from "@/lib/services/dataset.service"
import type { Dataset } from "@/lib/types/dataset"

export function useDatasets(filters?: DatasetFilters) {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDatasets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await datasetService.getDatasets(filters)
      setDatasets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch datasets")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchDatasets()
  }, [fetchDatasets])

  const refetch = useCallback(() => {
    fetchDatasets()
  }, [fetchDatasets])

  return {
    datasets,
    loading,
    error,
    refetch,
  }
}

export function useDataset(id: string) {
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDataset() {
      try {
        setLoading(true)
        setError(null)
        const data = await datasetService.getDataset(id)
        setDataset(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch dataset")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDataset()
    }
  }, [id])

  return {
    dataset,
    loading,
    error,
  }
}
