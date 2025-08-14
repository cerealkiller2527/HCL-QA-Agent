"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({ children, defaultTheme = "dark", storageKey = "lerobot-theme" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme | undefined>(undefined)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme
    const initialTheme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : defaultTheme
    setThemeState(initialTheme)
    setMounted(true)
  }, [defaultTheme, storageKey])

  useEffect(() => {
    if (!theme) return

    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }

  if (!mounted || !theme) {
    return (
      <ThemeProviderContext.Provider value={{ theme: defaultTheme, setTheme }}>
        {children}
      </ThemeProviderContext.Provider>
    )
  }

  return <ThemeProviderContext.Provider value={{ theme, setTheme }}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
