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
  sizeFilter: string
  setSizeFilter: (size: string) => void
  dateFilter: string
  setDateFilter: (date: string) => void
  tagFilter: string
  setTagFilter: (tag: string) => void
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
  sizeFilter,
  setSizeFilter,
  dateFilter,
  setDateFilter,
  tagFilter,
  setTagFilter,
  hasActiveFilters,
  clearFilters,
  resultsCount,
}: DatasetFiltersProps) {
  const clearSearch = () => setSearchQuery("")

  return (
    <>
      <motion.div className="space-y-4" variants={ANIMATION.variants.staggerItem}>
        {/* Search Bar */}
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

        <div className="flex flex-wrap gap-3">
          <CustomDropdown
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder="All Status"
            className="w-[140px]"
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "processing", label: "Processing" },
              { value: "ready", label: "Ready" },
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

          <CustomDropdown
            value={sizeFilter}
            onValueChange={setSizeFilter}
            placeholder="All Sizes"
            className="w-[140px]"
            options={[
              { value: "all", label: "All Sizes" },
              { value: "small", label: "< 1GB" },
              { value: "medium", label: "1-10GB" },
              { value: "large", label: "10-100GB" },
              { value: "xlarge", label: "> 100GB" },
            ]}
          />

          <CustomDropdown
            value={dateFilter}
            onValueChange={setDateFilter}
            placeholder="All Dates"
            className="w-[140px]"
            options={[
              { value: "all", label: "All Dates" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "quarter", label: "Last 3 Months" },
              { value: "year", label: "This Year" },
            ]}
          />

          <CustomDropdown
            value={tagFilter}
            onValueChange={setTagFilter}
            placeholder="All Tags"
            className="w-[140px]"
            options={[
              { value: "all", label: "All Tags" },
              { value: "manipulation", label: "Manipulation" },
              { value: "navigation", label: "Navigation" },
              { value: "vision", label: "Computer Vision" },
              { value: "grasping", label: "Grasping" },
              { value: "simulation", label: "Simulation" },
              { value: "real-world", label: "Real World" },
            ]}
          />

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </motion.div>

      {hasActiveFilters && (
        <motion.div className="text-caption text-muted-foreground font-mono" variants={ANIMATION.variants.staggerItem}>
          Found {resultsCount} dataset{resultsCount !== 1 ? "s" : ""}
          {searchQuery && ` matching "${searchQuery}"`}
          {(statusFilter !== "all" ||
            robotTypeFilter !== "all" ||
            sizeFilter !== "all" ||
            dateFilter !== "all" ||
            tagFilter !== "all") &&
            " with current filters"}
        </motion.div>
      )}
    </>
  )
}
