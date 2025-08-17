"use client"

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'

interface PlaybackContextType {
  // Essential state
  isPlaying: boolean
  currentFrame: number
  playbackSpeed: number
  totalFrames: number
  currentTime: number
  
  // Essential controls
  togglePlay: () => void
  seekToFrame: (frame: number) => void
  setSpeed: (speed: number) => void
  setTotalFrames: (frames: number) => void
  addVideo: (video: HTMLVideoElement) => void
  removeVideo: (video: HTMLVideoElement) => void
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined)

interface PlaybackProviderProps {
  children: React.ReactNode
  fps?: number
  episodeDuration?: number
  episodeId?: string | number
}

export function PlaybackProvider({ 
  children, 
  fps = 30, 
  episodeDuration = 60,
  episodeId
}: PlaybackProviderProps) {
  // Simple state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [totalFrames, setTotalFrames] = useState(1000)
  
  // Simple video registry
  const videoRefs = useRef<HTMLVideoElement[]>([])
  
  // Episode change tracking
  const previousEpisodeId = useRef(episodeId)
  
  // Reset playback when episode changes
  useEffect(() => {
    if (previousEpisodeId.current !== episodeId) {
      // Stop current playback
      setIsPlaying(false)
      
      // Reset to beginning
      setCurrentFrame(0)
      
      // Pause all videos and reset their time
      videoRefs.current.forEach(video => {
        video.pause()
        video.currentTime = 0
      })
      
      // Clear video registry for clean slate
      videoRefs.current = []
      
      // Update episode reference
      previousEpisodeId.current = episodeId
    }
  }, [episodeId])
  
  // Derived values
  const currentTime = (currentFrame / totalFrames) * episodeDuration
  
  // Unified timing system - either paused (manual control) or playing (video-driven)
  const animationFrameRef = useRef<number>()
  const isSeekingRef = useRef(false)
  
  useEffect(() => {
    const updateFrame = () => {
      if (isSeekingRef.current) {
        // During seeking, don't update from video to avoid conflicts
        animationFrameRef.current = requestAnimationFrame(updateFrame)
        return
      }
      
      if (isPlaying && videoRefs.current.length > 0) {
        // When playing, sync frame from video time
        const firstVideo = videoRefs.current[0]
        if (firstVideo && !firstVideo.paused) {
          const videoTime = firstVideo.currentTime
          const frameFromVideo = Math.floor((videoTime / episodeDuration) * totalFrames)
          setCurrentFrame(Math.min(frameFromVideo, totalFrames - 1))
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(updateFrame)
    }
    
    animationFrameRef.current = requestAnimationFrame(updateFrame)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, totalFrames, episodeDuration])
  
  // Simple control methods
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      const newPlaying = !prev
      videoRefs.current.forEach(video => {
        if (newPlaying) {
          video.play().catch(() => {}) // Ignore play errors
        } else {
          video.pause()
        }
      })
      return newPlaying
    })
  }, [])
  
  const seekToFrame = useCallback((frame: number) => {
    const clampedFrame = Math.max(0, Math.min(frame, totalFrames - 1))
    
    // Prevent animation loop from interfering during seek
    isSeekingRef.current = true
    
    // Update frame immediately
    setCurrentFrame(clampedFrame)
    
    // Calculate and set video time
    const time = (clampedFrame / totalFrames) * episodeDuration
    
    // Synchronize all videos to the new time
    videoRefs.current.forEach(video => {
      video.currentTime = time
    })
    
    // Allow a short delay for video to settle, then resume normal sync
    setTimeout(() => {
      isSeekingRef.current = false
    }, 50)
  }, [totalFrames, episodeDuration])
  
  const setSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed)
    videoRefs.current.forEach(video => {
      video.playbackRate = speed
    })
  }, [])
  
  // Robust video management with proper synchronization
  const addVideo = useCallback((video: HTMLVideoElement) => {
    if (!videoRefs.current.includes(video)) {
      videoRefs.current.push(video)
      
      // Set playback rate
      video.playbackRate = playbackSpeed
      
      // Sync to current time
      video.currentTime = currentTime
      
      // Ensure video state matches playback state
      if (isPlaying) {
        video.play().catch(() => {
          // Ignore autoplay restrictions
        })
      } else {
        video.pause()
      }
      
      // Add event listeners for better sync
      video.addEventListener('loadeddata', () => {
        video.currentTime = currentTime
        video.playbackRate = playbackSpeed
      })
      
      video.addEventListener('seeked', () => {
        // Ensure all videos stay in sync after individual seeks
        if (!isSeekingRef.current) {
          const targetTime = video.currentTime
          videoRefs.current.forEach(otherVideo => {
            if (otherVideo !== video && Math.abs(otherVideo.currentTime - targetTime) > 0.1) {
              otherVideo.currentTime = targetTime
            }
          })
        }
      })
    }
  }, [playbackSpeed, currentTime, isPlaying])
  
  // Video cleanup for performance
  const removeVideo = useCallback((video: HTMLVideoElement) => {
    const index = videoRefs.current.indexOf(video)
    if (index > -1) {
      videoRefs.current.splice(index, 1)
    }
  }, [])
  
  const value: PlaybackContextType = {
    isPlaying,
    currentFrame,
    playbackSpeed,
    totalFrames,
    currentTime,
    togglePlay,
    seekToFrame,
    setSpeed,
    setTotalFrames,
    addVideo,
    removeVideo,
  }
  
  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  )
}

export function usePlayback() {
  const context = useContext(PlaybackContext)
  if (context === undefined) {
    throw new Error('usePlayback must be used within a PlaybackProvider')
  }
  return context
}