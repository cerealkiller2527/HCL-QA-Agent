"use client"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { useRef } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleThemeToggle = () => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    const overlay = document.createElement("div")
    overlay.className = "theme-transition"

    const circle = document.createElement("div")
    circle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: ${theme === "light" ? "#0a0a0a" : "#ffffff"};
      transform: translate(-50%, -50%);
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 10000;
    `

    overlay.appendChild(circle)
    document.body.appendChild(overlay)

    requestAnimationFrame(() => {
      const size = Math.max(window.innerWidth, window.innerHeight) * 2.5
      circle.style.width = `${size}px`
      circle.style.height = `${size}px`
    })

    setTimeout(() => {
      setTheme(theme === "light" ? "dark" : "light")
    }, 300)

    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay)
      }
    }, 650)
  }

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={handleThemeToggle}
      className="relative overflow-hidden h-8 w-8 hover:bg-accent/50 transition-colors"
    >
      <motion.div
        animate={{ rotate: theme === "dark" ? -90 : 0, scale: theme === "dark" ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        <Sun className="h-4 w-4" />
      </motion.div>
      <motion.div
        animate={{ rotate: theme === "dark" ? 0 : 90, scale: theme === "dark" ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        <Moon className="h-4 w-4" />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
