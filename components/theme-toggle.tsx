"use client"
import { Moon, Sun } from "lucide-react"
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

    // Create transition overlay
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
      transition: width 0.6s ease-out, height 0.6s ease-out;
      z-index: 10000;
    `

    overlay.appendChild(circle)
    document.body.appendChild(overlay)

    // Trigger animation
    requestAnimationFrame(() => {
      const size = Math.max(window.innerWidth, window.innerHeight) * 2.5
      circle.style.width = `${size}px`
      circle.style.height = `${size}px`
    })

    // Change theme after animation starts
    setTimeout(() => {
      setTheme(theme === "light" ? "dark" : "light")
    }, 300)

    // Clean up
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
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
