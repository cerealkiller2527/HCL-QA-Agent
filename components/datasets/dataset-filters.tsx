"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomDropdown } from "@/components/ui/custom-dropdown"
import { Search, X, Filter } from "lucide-react"
import { ANIMATION } from "@/lib/constants"

interface DatasetFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  robotTypeFilter: string
  setRobotTypeFilter: (type: string) => void
  hasActiveFilters: boolean
  clearFilters: () => void
  resultsCount: number
}

export function DatasetFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  robotTypeFilter,
  setRobotTypeFilter,
  hasActiveFilters,
  clearFilters,
  resultsCount,
}: DatasetFiltersProps) {
  const clearSearch = () => setSearchQuery("")

  return (
    <>
      <motion.div className="flex flex-col sm:flex-row gap-4" variants={ANIMATION.variants.staggerItem}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets, tags, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-layer-1 border-border font-mono"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <CustomDropdown
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder="All Status"
            className="w-[140px]"
            options={[
              { value: "all", label: "All Status" },
              { value: "ready", label: "Ready" },
              { value: "processing", label: "Processing" },
              { value: "recording", label: "Recording" },
              { value: "error", label: "Error" },
            ]}
          />

          <CustomDropdown
            value={robotTypeFilter}
            onValueChange={setRobotTypeFilter}
            placeholder="All Types"
            className="w-[140px]"
            options={[
              { value: "all", label: "All Types" },
              { value: "arm", label: "Robotic Arm" },
              { value: "mobile", label: "Mobile Robot" },
              { value: "humanoid", label: "Humanoid" },
              { value: "custom", label: "Custom" },
            ]}
          />

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </motion.div>

      {hasActiveFilters && (
        <motion.div className="text-sm text-muted-foreground font-mono" variants={ANIMATION.variants.staggerItem}>
          Found {resultsCount} dataset{resultsCount !== 1 ? "s" : ""}
          {searchQuery && ` matching "${searchQuery}"`}
          {(statusFilter !== "all" || robotTypeFilter !== "all") && " with current filters"}
        </motion.div>
      )}
    </>
  )
}
