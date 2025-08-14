export const colorTokens = {
  // Base semantic colors
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",

  // Primary brand colors
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
    muted: "hsl(var(--primary) / 0.1)",
    subtle: "hsl(var(--primary) / 0.05)",
  },

  // Status colors
  success: {
    DEFAULT: "hsl(var(--success))",
    foreground: "hsl(var(--success-foreground))",
    muted: "hsl(var(--success) / 0.1)",
  },

  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
    muted: "hsl(var(--destructive) / 0.1)",
  },

  warning: {
    DEFAULT: "hsl(var(--warning))",
    foreground: "hsl(var(--warning-foreground))",
    muted: "hsl(var(--warning) / 0.1)",
  },

  // Layer system for depth
  layer: {
    0: "hsl(var(--layer-0))",
    1: "hsl(var(--layer-1))",
    2: "hsl(var(--layer-2))",
    3: "hsl(var(--layer-3))",
    hover: "hsl(var(--layer-hover))",
    active: "hsl(var(--layer-active))",
  },

  // Text colors
  text: {
    primary: "hsl(var(--foreground))",
    secondary: "hsl(var(--muted-foreground))",
    accent: "hsl(var(--primary))",
    success: "hsl(var(--success))",
    warning: "hsl(var(--warning))",
    destructive: "hsl(var(--destructive))",
  },

  // Border and input colors
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
} as const

export type ColorToken = keyof typeof colorTokens
