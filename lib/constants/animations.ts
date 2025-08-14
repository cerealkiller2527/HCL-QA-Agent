export const ANIMATION_DURATION = {
  // Micro-interactions (hover, focus, small state changes)
  fast: 0.15,
  // Component state changes (modals, dropdowns, cards)
  medium: 0.2,
  // Page transitions and major layout changes
  slow: 0.3,
  // Complex animations or data loading
  slower: 0.5,
} as const

export const ANIMATION_EASING = {
  // Standard easing for most interactions
  default: [0.4, 0.0, 0.2, 1],
  // Smooth entrance animations
  easeOut: [0.0, 0.0, 0.2, 1],
  // Quick exit animations
  easeIn: [0.4, 0.0, 1, 1],
  // Bouncy interactions for buttons and cards
  spring: [0.68, -0.55, 0.265, 1.55],
} as const

export const ANIMATION_VARIANTS = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Scale animations for cards and buttons
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  // Slide animations for modals and sidebars
  slideInFromRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },

  slideInFromLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },

  slideInFromBottom: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  // Stagger animations for lists
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
} as const

export const HOVER_ANIMATIONS = {
  // Subtle lift for cards
  lift: {
    scale: 1.02,
    y: -2,
    transition: { duration: ANIMATION_DURATION.fast, ease: ANIMATION_EASING.easeOut },
  },

  // Button press effect
  press: {
    scale: 0.98,
    transition: { duration: ANIMATION_DURATION.fast, ease: ANIMATION_EASING.easeIn },
  },

  // Glow effect for interactive elements
  glow: {
    boxShadow: "0 0 20px rgba(20, 184, 166, 0.3)",
    transition: { duration: ANIMATION_DURATION.medium, ease: ANIMATION_EASING.default },
  },
} as const
