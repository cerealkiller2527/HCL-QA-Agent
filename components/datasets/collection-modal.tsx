"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface CollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, color: string) => void
  initialName?: string
  initialColor?: string
  title?: string
}

const colors = [
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
  { name: "Red", value: "red", class: "bg-red-500" },
  { name: "Cyan", value: "cyan", class: "bg-cyan-500" },
]

export function CollectionModal({
  isOpen,
  onClose,
  onSave,
  initialName = "",
  initialColor = "blue",
  title = "Create Collection",
}: CollectionModalProps) {
  const [name, setName] = useState(initialName)
  const [selectedColor, setSelectedColor] = useState(initialColor)

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), selectedColor)
      setName("")
      setSelectedColor("blue")
      onClose()
    }
  }

  const handleClose = () => {
    setName(initialName)
    setSelectedColor(initialColor)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold font-sans">{title}</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="collection-name" className="font-sans">
              Collection Name
            </Label>
            <Input
              id="collection-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter collection name"
              className="mt-1"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          <div>
            <Label className="font-sans">Color</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className={`
                    w-10 h-10 rounded-lg border-2 transition-all
                    ${color.class}
                    ${
                      selectedColor === color.value
                        ? "border-foreground scale-110"
                        : "border-border hover:border-foreground/50"
                    }
                  `}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {title.includes("Create") ? "Create" : "Save"}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
