"use client"

import { useState, useEffect } from "react"

export function Clock() {
  const [time, setTime] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString())
    }
    
    updateTime() // Set initial time
    const interval = setInterval(updateTime, 1000) // Update every second
    
    return () => clearInterval(interval)
  }, [])

  // Don't render anything on server side to avoid hydration mismatch
  if (!mounted) {
    return <div className="text-code text-muted-foreground font-mono text-sm">--:--:--</div>
  }

  return (
    <div className="text-code text-muted-foreground font-mono text-sm">
      {time}
    </div>
  )
}