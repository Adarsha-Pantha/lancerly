/**
 * Lancerly Design Tokens
 * Production-ready design system for consistent spacing, typography, and colors
 * Step 1: Global Design System (Teal primary + Purple accent)
 */

export const spacing = {
  0: "0",
  1: "0.25rem",   // 4px – tight (icon gaps)
  2: "0.5rem",    // 8px – small (inline elements)
  3: "0.75rem",   // 12px – medium (form fields)
  4: "1rem",      // 16px – default (card padding start)
  5: "1.25rem",   // 20px
  6: "1.5rem",    // 24px – large (section gaps)
  8: "2rem",      // 32px – xlarge (between sections)
  10: "2.5rem",   // 40px
  12: "3rem",     // 48px – xxlarge (page sections)
  16: "4rem",     // 64px – navbar height
  20: "5rem",     // 80px
  24: "6rem",     // 96px
} as const;

export const radius = {
  sm: "0.5rem",   // 8px – inputs, small elements
  md: "0.75rem",  // 12px – buttons
  lg: "1rem",     // 16px – cards
  xl: "1.25rem",  // 20px
  "2xl": "1.5rem", // 24px
  full: "9999px",
} as const;

export const typography = {
  display: "text-3xl md:text-4xl font-bold tracking-tight leading-tight",
  h1: "text-2xl md:text-3xl font-bold tracking-tight",
  h2: "text-xl md:text-2xl font-semibold",
  h3: "text-lg md:text-xl font-semibold",
  body: "text-base leading-relaxed",
  bodySm: "text-sm leading-relaxed",
  caption: "text-sm text-muted-foreground",
  label: "text-sm font-medium",
} as const;

/** Max content width for centered layouts */
export const layout = {
  maxWidth: "max-w-7xl",
  contentPadding: "px-4 sm:px-6 lg:px-8",
  navbarHeight: "h-16",
} as const;
