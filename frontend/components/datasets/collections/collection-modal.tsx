"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CollectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateCollection: (data: { name: string; description: string; color: string }) => void
}

const colors = [
  { name: "Primary", value: "bg-primary", ring: "ring-primary" },
  { name: "Success", value: "bg-green-500", ring: "ring-green-500" },
  { name: "Warning", value: "bg-yellow-500", ring: "ring-yellow-500" },
  { name: "Danger", value: "bg-red-500", ring: "ring-red-500" },
  { name: "Info", value: "bg-blue-500", ring: "ring-blue-500" },
  { name: "Purple", value: "bg-purple-500", ring: "ring-purple-500" },
  { name: "Pink", value: "bg-pink-500", ring: "ring-pink-500" },
  { name: "Cyan", value: "bg-cyan-500", ring: "ring-cyan-500" },
]

export function CollectionModal({ open, onOpenChange, onCreateCollection }: CollectionModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedColor, setSelectedColor] = useState(colors[0].value)

  const handleCreate = () => {
    if (name.trim()) {
      onCreateCollection({
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
      })
      // Reset form
      setName("")
      setDescription("")
      setSelectedColor(colors[0].value)
      onOpenChange(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName("")
      setDescription("")
      setSelectedColor(colors[0].value)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-layer-1 border-border">
        <DialogHeader>
          <DialogTitle className="text-title">Create New Collection</DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Create a collection to organize your datasets. You can drag and drop datasets into collections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="collection-name" className="text-body-medium">
              Collection Name
            </Label>
            <Input
              id="collection-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter collection name..."
              className="bg-layer-2 border-border focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleCreate()}
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="collection-description" className="text-body-medium">
              Description <span className="text-muted-foreground text-body">(optional)</span>
            </Label>
            <Textarea
              id="collection-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this collection contains..."
              className="bg-layer-2 border-border focus:border-primary resize-none"
              rows={3}
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <Label className="text-body-medium">Collection Color</Label>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className={`
                    relative w-full h-12 rounded-lg transition-all duration-200
                    ${color.value}
                    ${
                      selectedColor === color.value
                        ? `ring-2 ${color.ring} ring-offset-2 ring-offset-layer-1 scale-105`
                        : "hover:scale-105 hover:shadow-md"
                    }
                  `}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="text-body">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()} className="text-body bg-primary hover:bg-primary/90">
            Create Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
