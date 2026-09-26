---
name: Obsidian Telemetry
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system drives a mission-critical, enterprise-grade warehouse management and logistics telemetry platform. The visual aesthetic fuses the utilitarian precision of modern engineering environments (Linear, Vercel) with the real-time operational clarity of supply chain control towers (Flexport, Datadog). 

The emotional tone balances absolute reliability, high operational efficiency, and cutting-edge intelligence:
- **Precision & Control:** High-density layouts, laser-focused micro-typography, and crisp delineations reduce visual ambiguity during high-velocity warehouse decisions.
- **Calm Mastery:** A deep, rich, cold-slate dark atmosphere provides an immersive canvas that reduces eye fatigue across 12-hour shifts while letting state-dependent accents (critical alerts, status pills, live pick telemetry) emerge instantly.
- **Modern Tactical Elegance:** Subtle 1px translucent borders, restrained neon-glow micro-indicators, and frictionless interactions deliver a premier enterprise feel without distracting from operational speed.

## Colors

The palette leverages a calibrated dark-mode hierarchy built on deep neutral slates, punctuated by targeted, luminous accents for data density and state awareness.

- **Base & Canvas Surfaces:**
  - Canvas Root: `#090A0F` (deep obsidian zinc)
  - Card & Container Surface: `#13151C` (rich slate-black)
  - Elevated / Interactive Surface: `#1A1D27`
  - Floating / Dropdown / Popover Surface: `#202431`
- **Borders & Dividers:**
  - Structural Border Default: `#232733`
  - Subtle Inset / Divider: `rgba(255, 255, 255, 0.06)`
  - Active / Focus Border: `rgba(99, 102, 241, 0.45)`
- **Core Accents:**
  - **Primary (`#6366F1` Indigo/Electric Violet):** Primary CTAs, active tab strokes, selected batch runs, focus rings.
  - **Secondary (`#06B6D4` Refined Cyan):** Logistics telemetry, real-time routing, active sync indicators, telemetry sparkline overlays.
  - **Tertiary / Success (`#10B981` Emerald):** Healthy inventory stock, verified barcode scans, completed shipments, positive delta sparklines.
- **Functional Semantics:**
  - Warning / Reorder Point: `#F59E0B` (Amber)
  - Critical / Stockout / Exception: `#EF4444` (Crimson)
  - Neutral Metadata: `#64748B` (Muted Slate)
  - Text Primary: `#F8FAFC`
  - Text Secondary: `#94A3B8`

## Typography

Typography prioritizes compact, high-density legibility. Geist governs global interface elements, headers, and descriptions due to its clean geometric clarity and tight tabular proportions. JetBrains Mono is strictly designated for technical telemetry: SKU numbers, location bins (`A12-R4-B02`), lot codes, RFID tags, numerical deltas, and keyboard shortcut glyphs (`⌘K`, `⇧P`).

All numeric values in tabular contexts must use `font-variant-numeric: tabular-nums` to ensure instant visual scanning down columns. Line heights are calibrated tight to optimize data vertical rhythm without sacrificing accessibility.

## Layout & Spacing

The layout is built upon an enterprise fluid grid that spans 12 columns on desktop (`≥ 1280px`), 8 columns on tablet (`768px - 1279px`), and 4 columns on mobile (`< 768px`).

- **Density & Ergonomics:** High density is achieved by standardizing `space-sm` (8px) and `space-md` (12px) as the primary inner card and table cell paddings. Outer card containers leverage `space-lg` (20px).
- **Workspace Canvas:** Fixed collapsed sidebar (64px) or expanded state (240px) locks to the left, allowing the telemetry canvas to flex 100% across the viewport.
- **Split Workstations:** Split-pane views (e.g., manifest table on the left, SKU inspector panel on the right) lock the inspector to a fixed 420px width while the primary grid flexes with horizontal scroll safeguards.

## Elevation & Depth

Visual hierarchy uses tonal surface layering and low-contrast borders instead of heavy drop shadows, maintaining crisp contrast against the dark base:

1. **Base Tier (Ground):** `#090A0F` flat background. No borders, no shadows.
2. **Surface Tier (Cards, Grids):** `#13151C` with a crisp `1px solid #232733` border. Subtle ambient drop: `0 1px 3px rgba(0, 0, 0, 0.4)`.
3. **Elevated Tier (Interactive Row Hover, Dropdowns, Segmented Bars):** `#1A1D27` with `1px solid rgba(255, 255, 255, 0.08)`. Shadow: `0 4px 12px rgba(0, 0, 0, 0.5)`.
4. **Overlay Tier (Modals, Command Palettes, Flyout Drawers):** `#202431` backed by a `backdrop-filter: blur(12px) rgba(9, 10, 15, 0.75)` backdrop mask. Border: `1px solid rgba(255, 255, 255, 0.12)`. Shadow: `0 16px 36px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05)`.
5. **Glow States:** Active or critical alerts emit a soft 8px radial colored bloom:
   - Live/Success: `0 0 8px rgba(16, 185, 129, 0.35)`
   - Processing/Primary: `0 0 10px rgba(99, 102, 241, 0.35)`
   - Disruption/Error: `0 0 10px rgba(239, 68, 68, 0.4)`

## Shapes

The design system maintains a modern, controlled architectural shape language:
- Standard elements (inputs, action buttons, table rows, badges) use soft 4px (`0.25rem`) corner radiuses for an engineered, precise feel.
- Structural cards, modals, and metric KPI widgets use 8px (`0.5rem`) corner radiuses (`rounded-lg`).
- Flyout dialogs and command palette containers use 12px (`0.75rem`) corner radiuses (`rounded-xl`).
- Status indicator pills and live notification dots exclusively use fully rounded pill geometry (`9999px`) to immediately distinguish dynamic state tags from structural rectilinear containers.

## Components

### Buttons & Interactive Controls
- **Primary Button:** Background `#6366F1`, text `#FFFFFF`, font `Geist Medium 13px`. Crisp 1px border `rgba(255, 255, 255, 0.15) inset`. Hover: `#4F46E5` with `0 0 12px rgba(99, 102, 241, 0.35)`.
- **Secondary Button:** Surface `#1A1D27`, border `1px solid #232733`, text `#F8FAFC`. Hover: `#202431`, border `rgba(255, 255, 255, 0.14)`.
- **Ghost Action:** Borderless, text `#94A3B8`. Hover: surface `rgba(255, 255, 255, 0.05)`, text `#F8FAFC`.
- **Input Fields & Global Search:** Surface `#13151C`, border `1px solid #232733`, text `#F8FAFC`, placeholder `#64748B`. Focus state transitions border to `#6366F1` and introduces a `0 0 0 2px rgba(99, 102, 241, 0.2)` ring. Integrated shortcut badges (`⌘K`) sit flushed right using `JetBrains Mono 10px` on `#1A1D27`.

### Data Tables & Micro-Interactions
- **Header:** Sticky, surface `#090A0F`, text uppercase `label-mono-sm` (`#64748B`), bottom border `1px solid #232733`.
- **Rows:** Height 40px (compact) / 48px (standard). Alternating rows remain uniform `#13151C`; on hover, background transitions smoothly (120ms ease) to `#1A1D27` with an active `#6366F1` 2px left accent marker on selection.
- **Checkboxes:** 14px × 14px, 3px border-radius, background `#1A1D27`, border `1px solid #232733`. Checked state fills `#6366F1` with an inner white check glyph.

### Status Pills & Glowing Badges
- Pill format: Height 20px, horizontal padding 8px, font `JetBrains Mono 11px`.
- Composed of a translucent tinted background (`12%` opacity), matching border (`24%` opacity), matching label text, and a leading 6px circular indicator dot exhibiting a soft radial glow (`box-shadow: 0 0 6px currentColor`).
  - *In Stock / Normal:* Emerald (`#10B981`)
  - *Allocated / Transit:* Cyan (`#06B6D4`)
  - *Low Stock / Pending:* Amber (`#F59E0B`)
  - *Stockout / Damaged:* Crimson (`#EF4444`)

### KPI Metric Widgets & Sparklines
- Surface `#13151C` with `1px solid #232733`.
- Contains category title (`label-md`, `#64748B`), massive metric stat (`headline-lg`, tabular numbers), and trend pill (e.g. `+14.2%`).
- Embedded SVG sparkline spans bottom edge with zero margins, colored `#06B6D4` or `#10B981` with an ambient vertical gradient fill fading to transparent (`rgba(6, 182, 212, 0.12)` to `rgba(6, 182, 212, 0)`).

### Command Palette & Modal Dialogs
- Centered overlay at 640px maximum width. Top-anchored at 15% viewport height.
- Background `#13151C`, border `1px solid rgba(255, 255, 255, 0.1)`, 16px blurred backdrop.
- Instant search input atop, partitioned by `1px solid #232733`, leading to a filtered list grouped by categories (Actions, Warehouses, SKUs).