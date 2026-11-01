# Resume Shelf — Design System & Visual Guidelines

## 1. Aesthetic Direction: "The Warm Library"
Resume Shelf avoids sterile dashboards, generic purple gradients, and standard template UI. It is styled after a classic library study with warm paper backgrounds, rich walnut shelves, muted book spine palettes, and tactile micro-interactions.

---

## 2. Color Tokens

### 2.1 Surfaces & Neutrals
All colors are defined as CSS variables in [`src/styles/tokens.css`](file:///e:/Project/R3sumeShelf/src/styles/tokens.css):

| Token | Light Value | Dark Value | Purpose |
| :--- | :--- | :--- | :--- |
| `--color-paper` | `#F6F3EE` | `#1C1510` | Main canvas / page background |
| `--color-walnut` | `#3D2B1F` | `#D4C5A9` | Shelf bases, titles, primary accents |
| `--color-walnut-light` | `#6B4C3B` | `#B8A890` | Shelf highlights and borders |
| `--color-ink` | `#1A1208` | `#F0EAE0` | Primary text and headings |
| `--color-muted` | `#8B7355` | `#9B8B70` | Secondary metadata and labels |
| `--color-border` | `#D4C5A9` | `#3D2B1F` | Dividing lines and card borders |
| `--color-surface` | `#FFFFFF` | `#261A12` | Dialogs, cards, inputs |
| `--color-surface-raised`| `#FAF8F4` | `#2E2018` | Elevated chips, kbd badges |

### 2.2 Curated Spine Palette (8 Muted Tones)
Resumes deterministically select a default color based on their UUID or user selection:
- `--spine-0`: `#C17B5A` (Terra Cotta)
- `--spine-1`: `#7A9E7E` (Sage Green)
- `--spine-2`: `#5B7FA6` (Slate Blue)
- `--spine-3`: `#9B7BAE` (Dusty Violet)
- `--spine-4`: `#C9A84C` (Antique Ochre)
- `--spine-5`: `#A65B5B` (Muted Burgundy)
- `--spine-6`: `#5B8A8A` (Deep Teal)
- `--spine-7`: `#8A7B5B` (Raw Umber)

---

## 3. Typography
Fonts are self-hosted via `@fontsource` to prevent external network requests:
- **Serif (Headings & Spines)**: `Fraunces Variable` (`--font-serif`) — Used for shelf titles, modal headers, and book spines.
- **Sans-Serif (UI & Controls)**: `Inter Variable` (`--font-sans`) — Used for body copy, buttons, badges, and metadata.

---

## 4. UI Components & Layout Rules

### 4.1 Book Spine (`Book.tsx`)
- **Width**: `44px` on mobile, `48px` on desktop.
- **Height**: Variable height calculated as `165px + min(pageCount * 12, 45px)`.
- **Spine Text**: Rotated 180° with `writing-mode: vertical-rl` and serif font.
- **Pinned Ribbons**: Golden bookmark ribbon positioned at the top edge.
- **Shadows**: `--shadow-book` for resting state, `--shadow-book-hover` for active elevation.

### 4.2 Hover Card (`BookHoverCard.tsx`)
- Opens after a `120ms` delay via Radix UI HoverCard.
- Auto-flips at screen boundaries.
- Displays version badge, role headline, 3-line summary, top 5 skill chips, and download statistics.

### 4.3 Shelves (`Shelf.tsx`)
- Wooden walnut shelf plank rendered with linear gradients and subtle drop-shadows.
- Includes expandable/collapsible shelf toggles, category badge, and count chips.
- Shelf lines support horizontal overflow scrolling with hidden scrollbars.

---

## 5. Motion & Accessibility
- **Hover Transitions**: `hover:-translate-y-2` on books with smooth easing.
- **Reduced Motion**: Full override in `globals.css` that disables transforms and animations when `prefers-reduced-motion: reduce` is enabled.
- **Focus Rings**: High-contrast, visible focus rings on all interactive elements.
