# Architecture Decisions

## 2026-10-24 — Initial Setup

- Using npm (not pnpm) per spec
- Node.js v22.12.0 LTS (portable install)
- Tailwind v4 with @tailwindcss/vite plugin (no tailwind.config.js needed)
- ESLint flat config format (eslint.config.js)
- Vitest with jsdom for unit/component tests
- Playwright for E2E (3 core flows)
- Fonts self-hosted via @fontsource — no external requests
- pdfjs-dist dynamically imported only in services/pdf.ts
- StorageAdapter interface in storage/adapter.ts — only storage/ imports Dexie

## 2026-11-01 — Phase 3: Upload and Drawer Implementation

- Full-page drag-and-drop overlay (`DropOverlay.tsx`) activates whenever files enter the window and cleans up on drop/exit.
- `UploadDialog.tsx` handles PDF/DOCX ingestion, extracts metadata lazily via `pdfjs-dist`, suggests technical skills from `domain/skills.ts`, and computes SHA-256 digests.
- `ResumeDrawer.tsx` features a responsive Radix-backed right-sheet on desktop and bottom-sheet on mobile devices with lazy first-page PDF canvas rendering (`PdfPreview.tsx`).
- Action workflows: instant one-click download, duplicate, move between shelves, pin/unpin ribbon toggle, and permanent delete with confirm guard.

## 2026-11-01 — Phase 4: Search and Extraction

- Global keyboard shortcuts: `/` (when not typing in an input) and `Cmd/Ctrl+K` toggle the `CommandPalette`.
- Client-side search index (`searchIndex.ts`) searches across role titles, headlines, summaries, skill chips, tailored company names, and extracted PDF text.
- Full text index is loaded lazily from IndexedDB on first search query and cached in memory. Mutations invalidate the cache automatically.
- Search results are grouped by category/shelf, with visual badges distinguishing title matches, skill matches, company matches, and deeper body matches inside PDFs.
- Arrow keys (`↑` / `↓`) navigate search results; `Enter` opens the resume drawer; `Shift+Enter` immediately triggers instant download.
