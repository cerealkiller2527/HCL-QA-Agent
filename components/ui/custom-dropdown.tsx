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
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute top-full z-50 mt-1 min-w-48 rounded-lg border border-border bg-popover shadow-lg backdrop-blur-sm",
              "overflow-hidden",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            <div className="py-1">
              {items.map((item, index) => (
                <div key={index}>
                  {item.separator && index > 0 && <div className="my-1 h-px bg-border" />}
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "flex w-full items-center px-3 py-2 text-sm font-sans text-left transition-colors",
                      "hover:bg-accent focus:bg-accent focus:outline-none",
                      item.destructive
                        ? "text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                        : "text-foreground hover:text-accent-foreground focus:text-accent-foreground",
                    )}
                  >
                    {item.icon && <span className={cn("mr-2", item.destructive && "text-red-600")}>{item.icon}</span>}
                    <span>{item.label}</span>
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
