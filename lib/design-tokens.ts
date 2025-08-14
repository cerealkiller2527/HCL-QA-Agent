export const designTokens = {
  // Color semantic tokens
  colors: {
    // Base colors
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",

    // Interactive colors
    primary: "hsl(var(--primary))",
    primaryForeground: "hsl(var(--primary-foreground))",
    secondary: "hsl(var(--secondary))",
    secondaryForeground: "hsl(var(--secondary-foreground))",

    // Status colors
    success: "hsl(var(--success))",
    successForeground: "hsl(var(--success-foreground))",
    warning: "hsl(var(--warning))",
    warningForeground: "hsl(var(--warning-foreground))",
    destructive: "hsl(var(--destructive))",
    destructiveForeground: "hsl(var(--destructive-foreground))",

    // Layer system for depth
    layer: {
      0: "hsl(var(--layer-0))",
      1: "hsl(var(--layer-1))",
      2: "hsl(var(--layer-2))",
      3: "hsl(var(--layer-3))",
      hover: "hsl(var(--layer-hover))",
      active: "hsl(var(--layer-active))",
    },

    // UI elements
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    muted: "hsl(var(--muted))",
    mutedForeground: "hsl(var(--muted-foreground))",
  },

  // Typography tokens
  typography: {
    fontFamily: {
      sans: "var(--font-inter)",
      mono: "var(--font-jetbrains-mono)",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: "1.1",
      snug: "1.2",
      normal: "1.5",
      relaxed: "1.6",
    },
    letterSpacing: {
      tight: "-0.03em",
      snug: "-0.025em",
      normal: "0",
      wide: "0.025em",
    },
  },

  // Spacing tokens
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },

  // Border radius tokens
  borderRadius: {
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    lg: "var(--radius)",
    full: "9999px",
  },

  // Animation tokens
  animation: {
    duration: {
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
    },
    easing: {
      easeOut: "ease-out",
      easeIn: "ease-in",
      easeInOut: "ease-in-out",
    },
  },
} as const

// Status color mappings
export const statusColors = {
  online: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
  },
  offline: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-muted",
  },
  maintenance: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/20",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
  },
  running: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  },
} as const

// Typography component classes
export const typographyClasses = {
  display: "font-heading-lg text-3xl md:text-4xl",
  title: "font-heading text-xl md:text-2xl",
  subtitle: "font-heading text-lg",
  body: "font-body text-base",
  bodyMedium: "font-body-medium text-base",
  label: "font-body-medium text-sm",
  caption: "font-body text-xs text-muted-foreground",
  code: "font-mono-sm",
} as const
