"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface CustomSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CustomSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  className,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">("bottom")

  const selectedOption = options.find((opt) => opt.value === value)

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

      // Check if dropdown should appear above or below
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        
        if (spaceBelow < 200 && spaceAbove > spaceBelow) {
          setDropdownPosition("top")
        } else {
          setDropdownPosition("bottom")
        }
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const handleSelect = (option: SelectOption) => {
    if (!option.disabled) {
      onValueChange?.(option.value)
      setIsOpen(false)
    }
  }

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between rounded-md border border-border",
          "bg-background px-2.5 py-1.5 text-sm transition-all duration-150",
          "hover:bg-layer-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-primary ring-offset-1",
          className
        )}
        disabled={disabled}
      >
        <span className={cn("block truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ml-1 flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropdownPosition === "bottom" ? -8 : 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropdownPosition === "bottom" ? -8 : 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute z-50 w-full rounded-md bg-layer-1 border border-border shadow-lg",
              "max-h-60 overflow-auto",
              dropdownPosition === "bottom" ? "top-full mt-1" : "bottom-full mb-1"
            )}
          >
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "relative flex w-full items-center px-2.5 py-1.5 text-sm transition-colors",
                    "hover:bg-layer-hover focus:bg-layer-hover focus:outline-none",
                    option.disabled && "cursor-not-allowed opacity-50",
                    option.value === value && "bg-layer-active"
                  )}
                  disabled={option.disabled}
                >
                  <span className="flex-1 text-left truncate">{option.label}</span>
                  {option.value === value && (
                    <Check className="h-3.5 w-3.5 text-primary ml-2 flex-shrink-0" />
                  )}
                </button>
              ))}
              {options.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">No options available</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}