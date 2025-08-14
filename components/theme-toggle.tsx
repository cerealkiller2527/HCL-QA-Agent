"use client"
import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeToggle}
      className="relative overflow-hidden h-8 w-8 hover:bg-accent/50 transition-colors font-mono"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -90, scale: 0, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.23, 1, 0.32, 1],
            opacity: { duration: 0.2 },
          }}
          className="absolute"
        >
          {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
