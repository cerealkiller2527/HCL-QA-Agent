"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "lerobot-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let initialTheme = defaultTheme

    try {
      const savedTheme = localStorage.getItem(storageKey) as Theme
      if (savedTheme && (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system")) {
        initialTheme = savedTheme
      }
    } catch (error) {
      console.warn("Failed to read theme from localStorage:", error)
    }

    setTheme(initialTheme)
    setMounted(true)
  }, [storageKey, defaultTheme])

  useEffect(() => {
    if (!theme) return

    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  const value = {
    theme: theme || defaultTheme,
    setTheme: (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch (error) {
        console.warn("Failed to save theme to localStorage:", error)
      }
      setTheme(newTheme)
    },
  }

  if (!mounted || !theme) {
    return null
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
