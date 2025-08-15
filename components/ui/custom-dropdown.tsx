"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface DropdownItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  destructive?: boolean
  separator?: boolean
}

interface CustomDropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: "start" | "end"
  className?: string
}

export function CustomDropdown({ trigger, items, align = "end", className }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const handleItemClick = (item: DropdownItem) => {
    item.onClick()
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute top-full z-50 mt-2 min-w-48 rounded-lg bg-layer-2 border border-border",
              "shadow-lg backdrop-blur-sm overflow-hidden",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            <div className="py-1">
              {items.map((item, index) => (
                <div key={index}>
                  {item.separator && index > 0 && <div className="my-1 h-px bg-border mx-2" />}
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "flex w-full items-center px-3 py-2.5 text-caption text-left transition-all duration-150",
                      "hover:bg-layer-hover focus:bg-layer-hover focus:outline-none",
                      "active:bg-layer-active active:scale-[0.98]",
                      item.destructive
                        ? "text-destructive hover:bg-destructive/20 hover:text-destructive focus:bg-destructive/20 focus:text-destructive"
                        : "text-foreground hover:text-foreground focus:text-foreground",
                    )}
                  >
                    {item.icon && (
                      <span
                        className={cn(
                          "mr-3 flex-shrink-0 transition-colors duration-150",
                          item.destructive ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        {item.icon}
                      </span>
                    )}
                    <span className="font-medium">{item.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
