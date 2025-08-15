"use client"

import type { Variants } from "framer-motion"
import { ANIMATION } from "@/lib/constants"

export const standardAnimations = {
  // Card animations
  card: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    hover: { y: -4, scale: 1.02 },
    tap: { scale: 0.98 },
  },

  // Stagger container
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },

  // Stagger items
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  // Slide animations
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  // Progress animations
  progress: {
    initial: { width: 0 },
    animate: (percentage: number) => ({ width: `${percentage}%` }),
  },
} as const

export function createStaggerAnimation(staggerDelay = 0.1): Variants {
  return {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  }
}

export function createSlideAnimation(direction: "up" | "down" | "left" | "right" = "up", distance = 20): Variants {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance }
      case "down":
        return { y: -distance }
      case "left":
        return { x: distance }
      case "right":
        return { x: -distance }
    }
  }

  return {
    initial: { opacity: 0, ...getInitialPosition() },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: ANIMATION.duration.medium,
        ease: ANIMATION.easing.easeOut,
      },
    },
    exit: {
      opacity: 0,
      ...getInitialPosition(),
      transition: {
        duration: ANIMATION.duration.fast,
        ease: ANIMATION.easing.default,
      },
    },
  }
}

export function createHoverAnimation(type: "lift" | "glow" | "scale" = "lift") {
  switch (type) {
    case "lift":
      return {
        y: -2,
        scale: 1.01,
        transition: { duration: ANIMATION.duration.fast, ease: ANIMATION.easing.easeOut },
      }
    case "glow":
      return {
        boxShadow: "0 0 20px rgba(20, 184, 166, 0.2)",
        transition: { duration: ANIMATION.duration.medium, ease: ANIMATION.easing.default },
      }
    case "scale":
      return {
        scale: 1.05,
        transition: { duration: ANIMATION.duration.fast, ease: ANIMATION.easing.default },
      }
  }
}
