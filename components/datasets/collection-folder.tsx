"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Folder, FolderOpen, MoreHorizontal, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomDropdown } from "@/components/ui/custom-dropdown"
import { ANIMATION } from "@/lib/constants"

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

interface CollectionFolderProps {
  collection: Collection
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  isExpanded?: boolean
}

export function CollectionFolder({ collection, onOpen, onEdit, onDelete, isExpanded = false }: CollectionFolderProps) {
  const [isHovered, setIsHovered] = useState(false)

  const folderColors = {
    blue: "bg-blue-500/20 border-blue-500/30",
    green: "bg-green-500/20 border-green-500/30",
    purple: "bg-purple-500/20 border-purple-500/30",
    orange: "bg-orange-500/20 border-orange-500/30",
    red: "bg-red-500/20 border-red-500/30",
    cyan: "bg-cyan-500/20 border-cyan-500/30",
  }

  const iconColors = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    orange: "text-orange-500",
    red: "text-red-500",
    cyan: "text-cyan-500",
  }

  return (
    <motion.div
      className="relative group"
      variants={ANIMATION.variants.staggerItem}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={`
          layer-card p-6 cursor-pointer transition-all duration-200
          ${folderColors[collection.color as keyof typeof folderColors]}
          hover:shadow-lg
        `}
        onClick={onOpen}
      >
        {/* Collection Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {isExpanded ? (
              <FolderOpen className={`h-8 w-8 ${iconColors[collection.color as keyof typeof iconColors]}`} />
            ) : (
              <Folder className={`h-8 w-8 ${iconColors[collection.color as keyof typeof iconColors]}`} />
            )}
            <div>
              <h3 className="font-semibold font-sans text-lg">{collection.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {collection.datasets.length} dataset{collection.datasets.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <CustomDropdown
                  trigger={
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  }
                  items={[
                    {
                      label: "Edit Collection",
                      icon: Edit2,
                      onClick: onEdit,
                    },
                    {
                      label: "Delete Collection",
                      icon: Trash2,
                      onClick: onDelete,
                      destructive: true,
                    },
                  ]}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dataset Preview Grid */}
        <div className="grid grid-cols-2 gap-2">
          {collection.datasets.slice(0, 4).map((dataset, index) => (
            <motion.div
              key={dataset.id}
              className="bg-background/50 rounded-lg p-2 border border-border/50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="text-xs font-mono truncate">{dataset.name}</div>
              <div className="text-xs text-muted-foreground">{dataset.episodes} eps</div>
            </motion.div>
          ))}

          {collection.datasets.length > 4 && (
            <div className="bg-background/30 rounded-lg p-2 border border-border/30 flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-mono">+{collection.datasets.length - 4} more</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
