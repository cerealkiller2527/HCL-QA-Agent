"use client"
import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { ANIMATION_DURATION, ANIMATION_EASING } from "@/lib/constants/animations"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleThemeToggle}
        className="relative overflow-hidden h-8 w-8 hover:bg-layer-hover transition-all duration-150"
      >
        <motion.div
          className="absolute inset-0 rounded-md"
          animate={{
            boxShadow: theme === "dark" ? "0 0 15px rgba(20, 184, 166, 0.2)" : "0 0 15px rgba(251, 191, 36, 0.2)",
          }}
          transition={{ duration: ANIMATION_DURATION.medium }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ scale: 0.6, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0, rotate: 180 }}
            transition={{
              duration: ANIMATION_DURATION.medium,
              ease: ANIMATION_EASING.spring,
            }}
            className="absolute"
          >
            <motion.div
              animate={{
                rotate: theme === "dark" ? [0, 5, -5, 0] : [0, -5, 5, 0],
                color: theme === "dark" ? "#14b8a6" : "#fbbf24",
              }}
              transition={{
                rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                color: { duration: ANIMATION_DURATION.medium },
              }}
            >
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <span className="sr-only">Toggle theme</span>
      </Button>
    </motion.div>
  )
}
