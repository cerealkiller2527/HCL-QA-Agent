"use client"

import { useEffect } from 'react'

export function ThemeInitializer() {
  useEffect(() => {
    // Safely initialize theme from localStorage
    try {
      const savedTheme = localStorage.getItem('lerobot-theme')
      const theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
      
      // Only add theme class if not already present
      if (!document.documentElement.classList.contains(theme)) {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
      }
    } catch (error) {
      // Fallback to dark theme if localStorage is not available
      console.warn('Failed to load theme preference:', error)
      document.documentElement.classList.add('dark')
    }
  }, [])

  return null
}