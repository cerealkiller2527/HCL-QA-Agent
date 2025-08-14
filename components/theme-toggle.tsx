"use client"
import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleThemeToggle = () => {
    if (!buttonRef.current || isTransitioning) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    setIsTransitioning(true)

    const overlay = document.createElement("div")
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    `

    const circle = document.createElement("div")
    const newTheme = theme === "light" ? "dark" : "light"
    circle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: ${newTheme === "dark" ? "hsl(var(--background))" : "hsl(var(--background))"};
      transform: translate(-50%, -50%);
      transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
      z-index: 10000;
    `

    circle.className = newTheme

    overlay.appendChild(circle)
    document.body.appendChild(overlay)

    requestAnimationFrame(() => {
      const size = Math.max(window.innerWidth, window.innerHeight) * 2.5
      circle.style.width = `${size}px`
      circle.style.height = `${size}px`

      setTimeout(() => {
        setTheme(newTheme)
      }, 200)
    })

    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay)
      }
      setIsTransitioning(false)
    }, 850)
  }

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={handleThemeToggle}
      disabled={isTransitioning}
      className="relative overflow-hidden h-8 w-8 hover:bg-accent/50 transition-colors font-mono"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -90, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          exit={{ rotate: 90, scale: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="absolute"
        >
          {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
