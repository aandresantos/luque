---
name: Precision Utility
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#bcc7de'
  on-tertiary: '#263143'
  tertiary-container: '#8691a7'
  on-tertiary-container: '#1f2a3c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  sidebar-width: 240px
  sidebar-collapsed: 64px
---

## Brand & Style

This design system is engineered for high-velocity recruitment workflows where information density and clarity are paramount. The brand personality is **Professional, Technological, and Objective**, positioning the product as an elite tool for power users rather than a casual interface.

The visual style follows a **Modern Minimalist** movement, heavily influenced by the "Linear" aesthetic. It prioritizes functionality through:
- **High Information Density:** Maximizing screen real estate without sacrificing legibility.
- **Monochromatic Sophistication:** A primary dark environment that reduces eye strain during long working sessions.
- **Subtle Precision:** Using micro-borders and tonal shifts instead of heavy shadows or bright colors to define hierarchy.
- **Intentional Friction:** UI elements respond with crisp, purposeful transitions that feel mechanical and reliable.

## Colors

The palette is rooted in a deep charcoal and zinc spectrum to create a "command center" atmosphere. 

- **Primary (Electric Indigo):** Reserved strictly for primary calls to action, active states, and critical progress indicators. It serves as the "active" signal in a sea of neutrals.
- **Neutral Scale:** We use a finely tuned scale of grays. The background is nearly black (#09090B), while surfaces use subtle lifts (#121212) to create depth.
- **Borders:** Borders are the primary method of separation. Use `#27272A` for standard component shells and `#3F3F46` for interactive hover states.
- **Typography Colors:** Use pure white (#FAFAFA) only for headlines and primary buttons. Secondary data points use Zinc-400 (#A1A1AA) to manage visual noise in data-heavy views.

## Typography

This design system utilizes **Geist** for its technical precision and exceptional legibility at small sizes. The typographic scale is condensed to support high-density layouts.

- **Technical Nuance:** Use `body-sm` (13px) for the majority of table data and candidate lists. This allows for more rows per screen without losing readability.
- **Hierarchy:** Contrast is achieved through weight and color rather than massive size jumps. A `headline-md` in white carries more weight than a larger body block in muted gray.
- **Labels:** `label-sm` is used for metadata, status tags, and secondary navigation items. The slight tracking (letter spacing) and uppercase transform ensure these remain distinct even at very small scales.

## Layout & Spacing

The layout philosophy is based on a **Strict 4px Grid System**.

- **Structure:** Use a fixed left-rail sidebar for primary navigation. The main content area should utilize a flexible fluid grid that maintains 24px margins on all sides.
- **Density:** In data views (like candidate pipelines), vertical spacing is tightened to 8px or 12px between items to ensure power users can scan dozens of entries without excessive scrolling.
- **Desktop First:** As a productivity tool, the layout prioritizes desktop workflows. On tablet devices, the sidebar collapses into an icon-only rail. On mobile, the system transitions to a single-column stack with a bottom navigation bar for quick status checks.

## Elevation & Depth

Depth in this design system is created through **Tonal Layering and Low-Contrast Outlines** rather than traditional shadows.

- **Layers:**
  - **Level 0 (Background):** Pure neutral (#09090B).
  - **Level 1 (Cards/Sidebar):** A subtle lift to #121212 with a 1px border of #27272A.
  - **Level 2 (Modals/Popovers):** Surface color #18181B. These are the only elements allowed to have an ambient shadow (0px 8px 24px rgba(0,0,0,0.5)) to separate them from the workspace.
- **Micro-Depth:** Use "Inner Glow" effects on primary buttons—a subtle 1px top border that is slightly lighter than the button color—to give them a physical, tactile feel without becoming skeuomorphic.

## Shapes

The shape language is **Soft and Precise**. 

- **Components:** Standard buttons, input fields, and cards use a 4px (0.25rem) radius. This sharp-but-not-harsh corner maintains the professional, technological aesthetic.
- **Avatars:** Candidate headshots should remain slightly rounded (4px) or square rather than circular to maintain the architectural feel of the grid.
- **Status Pills:** Status indicators (e.g., "In Review", "Hired") are the exception and can use a full pill radius to differentiate them from interactive buttons.

## Components

- **Buttons:** Primary buttons use the Electric Indigo background with white text. Secondary buttons are "Ghost" style—no background, zinc-200 text, and a border that only appears or intensifies on hover.
- **Inputs:** Fields are dark (#09090B) with a subtle #27272A border. On focus, the border transitions to the primary indigo with a 1px solid stroke. No outer glow or "halo" on focus.
- **Cards:** Cards are the primary container for candidate profiles. They should have no padding on the outer edges if they are part of a list, using thin dividers instead. If standalone, they use 16px internal padding.
- **Badges:** Use a "Dimmed" style for badges. A low-opacity version of the status color (e.g., 10% Green for "Qualified") with high-contrast text. This keeps the UI from looking like a "fruit salad" of competing colors.
- **Sidebar:** The sidebar is compact (240px). Icons are 16px and paired with `body-sm` text. Use a vertical "active" indicator (2px wide indigo line) on the far left of the active nav item.
- **Data Tables:** Row hover states should be a subtle shift to #18181B. Action buttons (edit, delete) should only appear on row hover to reduce visual clutter.