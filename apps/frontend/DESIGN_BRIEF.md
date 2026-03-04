# Lancerly — Professional UI/UX Design Brief

> Use this document as a prompt or implementation guide. Follow it step-by-step for a human-centered, professional design system.

---

## 1. Design Philosophy (Human-Centered)

**Core principles:**
- **Clarity over cleverness** — Every element should have a clear purpose. No decoration without function.
- **Progressive disclosure** — Show only what the user needs now. Reduce cognitive load.
- **Consistency breeds trust** — Same patterns everywhere: spacing, colors, interactions.
- **Accessibility by default** — Contrast ratios ≥ 4.5:1 for text, focus states, keyboard navigation.
- **Emotional resonance** — The platform should feel professional yet approachable, like a trusted partner.

---

## 2. Color System (Step-by-Step)

### 2.1 Background Layers
| Layer | Purpose | Hex | Usage |
|-------|---------|-----|-------|
| **Base** | Page background | `#F5F7FA` | Main app background, subtle warmth |
| **Surface** | Cards, modals | `#FFFFFF` | Content containers |
| **Elevated** | Dropdowns, popovers | `#FFFFFF` + shadow | Floating elements |
| **Sidebar** | Navigation | `#F0F3F9` | Left/right sidebars, slightly cooler |

### 2.2 Primary Palette
| Role | Color | Hex | Use for |
|------|-------|-----|---------|
| **Primary** | Deep indigo | `#2C304B` | Headings, primary buttons, nav active state |
| **Primary Light** | Muted indigo | `#3D4263` | Hover states, secondary text |
| **Accent** | Vibrant purple | `#7C3AED` or `#8B5CF6` | CTAs, active tabs, highlights, links |
| **Accent Hover** | Lighter purple | `#A78BFA` | Button hover, interactive feedback |

### 2.3 Semantic Colors
| Meaning | Color | Hex |
|---------|-------|-----|
| **Success** | Emerald | `#10B981` |
| **Warning** | Amber | `#F59E0B` |
| **Error** | Rose | `#F43F5E` |
| **Info** | Sky blue | `#0EA5E9` |

### 2.4 Neutral Scale (Text & Borders)
| Use | Color | Hex |
|-----|-------|-----|
| Primary text | `#1E293B` |
| Secondary text | `#64748B` |
| Muted/placeholder | `#94A3B8` |
| Borders | `#E2E8F0` |
| Dividers | `#F1F5F9` |

---

## 3. Typography (Step-by-Step)

### 3.1 Font Stack
```
Primary: "Inter", "Geist", system-ui, -apple-system, sans-serif
Monospace (code): "JetBrains Mono", "Fira Code", monospace
```

### 3.2 Scale & Hierarchy
| Element | Size | Weight | Line height | Letter spacing |
|---------|------|--------|-------------|----------------|
| H1 (Hero) | 2.5rem (40px) | 700 | 1.15 | -0.03em |
| H2 (Section) | 1.875rem (30px) | 600 | 1.25 | -0.02em |
| H3 (Card title) | 1.25rem (20px) | 600 | 1.3 | -0.01em |
| Body | 1rem (16px) | 400 | 1.5 | 0 |
| Small | 0.875rem (14px) | 400 | 1.5 | 0 |
| Caption | 0.75rem (12px) | 500 | 1.4 | 0.02em |

### 3.3 Rules
- Max line length: **65–75 characters** for body text.
- Paragraph spacing: **1.5em** between paragraphs.
- Headings: **0.5em** margin below.

---

## 4. Buttons (Step-by-Step)

### 4.1 Primary Button
- Background: `#7C3AED` (accent purple)
- Text: white, 500 weight, 0.875rem
- Padding: 10px 20px
- Border radius: 0.75rem (12px)
- Shadow: `0 2px 8px rgba(124, 58, 237, 0.3)`
- Hover: Slightly lighter purple, shadow increases
- Active: Slight scale down (0.98)
- Disabled: 50% opacity, no hover

### 4.2 Secondary Button
- Background: transparent or `#F1F5F9`
- Border: 1px solid `#E2E8F0`
- Text: `#1E293B`
- Same padding and radius as primary
- Hover: Background `#F8FAFC`, border darkens

### 4.3 Ghost Button
- Background: transparent
- Text: `#64748B`
- Hover: Background `#F1F5F9`, text `#1E293B`

### 4.4 Destructive Button
- Background: `#F43F5E` (rose)
- Text: white
- Use sparingly: delete, remove, reject

### 4.5 Icon Buttons
- Size: 40×40px (touch-friendly)
- Border radius: 0.5rem
- Icon: 20×20px, centered

---

## 5. Cards & Surfaces (Step-by-Step)

### 5.1 Light Card (Default)
- Background: `#FFFFFF`
- Border: 1px solid `#E2E8F0`
- Border radius: 1rem (16px)
- Shadow: `0 1px 3px rgba(0,0,0,0.06)`
- Padding: 1.5rem (24px)

### 5.2 Dark Card (Accent sections)
- Background: `#2C304B` (deep indigo)
- Text: white
- Border radius: 1rem
- Use for: Notifications, calendar, featured blocks

### 5.3 Hover State
- Shadow: `0 4px 12px rgba(0,0,0,0.08)`
- Optional: 1px border `#E2E8F0` → `#CBD5E1`

---

## 6. Home / Landing Page (Step-by-Step)

### 6.1 Hero Section
- **Headline:** One clear value proposition (e.g., "Connect with top freelancers. Get work done.")
- **Subheadline:** 1–2 sentences, max 120 characters
- **CTA:** Primary button ("Get Started" / "Post a Project") + Secondary ("Browse Freelancers")
- **Visual:** Illustration or subtle gradient mesh, not overwhelming
- **Background:** Soft gradient `#F5F7FA` → `#EEF2FF` (very light purple tint)

### 6.2 Trust Indicators (Below Hero)
- Logos of partners or "Trusted by X companies"
- Stats: "10,000+ projects", "500+ freelancers"
- Keep minimal; avoid clutter

### 6.3 How It Works (3 Steps)
- Numbered steps: 1, 2, 3
- Icon + title + short description per step
- Cards with light background, consistent spacing

### 6.4 Featured / Categories
- Grid of project categories or featured freelancers
- Card hover: subtle lift, accent border or shadow
- Clear "View all" link

### 6.5 CTA Section (Before Footer)
- Strong headline
- Single primary CTA
- Background: light accent tint (`#F5F3FF`)

### 6.6 Footer
- Links: About, Contact, Privacy, Terms
- Social icons (if relevant)
- Copyright
- Minimal, not dense

---

## 7. Layout & Spacing (Step-by-Step)

### 7.1 Spacing Scale (8px base)
- `4px` — Tight (icon gaps)
- `8px` — Small (inline elements)
- `12px` — Medium (form fields)
- `16px` — Default (card padding start)
- `24px` — Large (section gaps)
- `32px` — XLarge (between major sections)
- `48px` — XXLarge (page sections)

### 7.2 Grid
- Max content width: **1200px** (centered)
- Sidebar: **240px** (collapsible on mobile)
- Right sidebar: **280px** (optional, hide on tablet)

### 7.3 Breakpoints
- Mobile: &lt; 640px
- Tablet: 640px – 1024px
- Desktop: ≥ 1024px

---

## 8. Interactive States (Human-Centered)

| State | Feedback |
|-------|----------|
| **Hover** | Cursor pointer, slight color/shadow change |
| **Focus** | Visible ring (2px, accent color, 2px offset) |
| **Active/Pressed** | Slight scale (0.98) or darker shade |
| **Loading** | Skeleton or spinner, never block entire page |
| **Error** | Inline message, red border, icon |
| **Success** | Brief toast or checkmark, then dismiss |

---

## 9. Navigation (Step-by-Step)

### 9.1 Top Bar
- Logo left
- Search center (prominent, rounded)
- Right: Notifications, avatar, dropdown
- Height: 64px
- Background: white, 1px bottom border

### 9.2 Sidebar
- Background: `#F0F3F9`
- Active item: accent background (`#7C3AED`), white text
- Icons: 20×20px, 16px gap to label
- Collapse to icons-only on narrow screens

### 9.3 Breadcrumbs
- For deep pages: Home > Projects > [Project Name]
- Separator: `/` or chevron
- Current page: bold, not clickable

---

## 10. Forms (Step-by-Step)

- Label above field, 12px gap
- Input height: 44px (touch-friendly)
- Border radius: 0.5rem
- Border: 1px solid `#E2E8F0`
- Focus: 2px ring accent, border accent
- Error: Red border, error message below
- Placeholder: `#94A3B8`, not too light

---

## 11. Implementation Checklist

- [ ] Apply color variables in CSS/Tailwind
- [ ] Set up typography scale
- [ ] Create button variants (primary, secondary, ghost, destructive)
- [ ] Build card components (light + dark)
- [ ] Implement hero + CTA on landing
- [ ] Add hover/focus states to all interactive elements
- [ ] Ensure 4.5:1 contrast for all text
- [ ] Test on mobile (touch targets ≥ 44px)
- [ ] Add loading states for async actions
- [ ] Implement consistent error handling UI

---

## 12. One-Line Prompt (For AI / Design Tools)

> "Design a modern freelancer platform UI with a soft gray-blue background (#F5F3F9), white cards, deep indigo (#2C304B) for headings and dark sections, vibrant purple (#7C3AED) for CTAs and active states, emerald (#10B981) for success, clean Inter typography, 16px rounded corners on cards, 12px on buttons, generous whitespace, human-centered and accessible. Hero with clear value prop, 3-step 'How it works', and minimal footer. Professional yet approachable."

---

*Use this brief as a living document. Adjust colors and spacing to match your brand while keeping the principles consistent.*
