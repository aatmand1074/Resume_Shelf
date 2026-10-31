# Resume Shelf: Plan, Architecture & Coding-Agent Prompt

Oct 24, 2026 · @Aatman D

## What this is

Resume Shelf is a static web app that keeps every version of your resume on a visual bookshelf, one shelf per job type (Data Analyst, AI/ML Engineer, and so on). Hover a book to see a short summary, click it to preview and download, and add new resumes by dropping a file onto the right shelf.

The one hard constraint is **no backend**. All data lives in the browser (IndexedDB) and the build output is plain static files, so Vercel's free tier hosts it at no cost.

The bar is daily use, not a demo:

- Open the app and find the right resume in under 5 seconds
- No silent data loss: one-click backup and restore
- Works on a phone, so you can download a resume during a recruiter call
- Boring, typed, tested code you can still maintain in six months

Not in v1: accounts or login, server sync, a resume builder or editor, AI-written resumes, ATS scoring.

## Key decisions

Build it as a Vite + React + TypeScript single-page app that stores files and metadata in IndexedDB through Dexie. Nothing else is needed to run it.

| Area | Choice | Why |
| --- | --- | --- |
| Framework | Vite + React 19 + TypeScript (strict) | Static build, instant dev server, no server runtime to pay for. Next.js adds nothing here. |
| Styling and UI | Tailwind CSS + Radix UI primitives (shadcn/ui style) | Accessible dialogs, menus and tooltips without writing them yourself. |
| Storage | IndexedDB via Dexie | Holds binary files natively (localStorage caps near 5 MB and stores strings only). |
| Reactivity | Dexie `useLiveQuery` | The UI updates from the database directly, so no Redux or Zustand store to keep in sync. |
| PDF handling | `pdfjs-dist`, lazy loaded | Client-side text extraction for search and skill suggestions, and first-page thumbnails. |
| Validation | Zod | Validates form input and backup files on import. |
| Backup | `fflate` zip: `manifest.json` plus the files | Real backup you can keep in Drive or email to yourself. |
| Animation | Framer Motion | Shelf layout, hover card and drawer transitions. |
| Drag and drop | `@dnd-kit` | Reorder shelves and move a book between shelves. |
| Tests | Vitest + Testing Library, Playwright for 3 core flows | Upload, download and backup/restore must not break. |
| Hosting | Vercel static (`vercel.json` SPA rewrite) | Free tier, deploy on every git push. |

**The trade-off to accept:** data lives in one browser on one device. Clearing site data, switching browsers or switching phones loses it. The app handles this with three things: it requests persistent storage (`navigator.storage.persist()`), it nudges you to export a backup every 14 days, and import restores everything exactly. Safari can clear storage for sites you haven't visited in a while, so installing the app to the home screen as a PWA is recommended on iPhone.

There is no cross-device sync without a backend. If you later want it, the storage layer is built behind an interface so a free-tier service can be added without touching the UI (see the last section).

## Data model

Six IndexedDB stores, with file bytes and extracted text kept apart from metadata so the shelf view never loads a blob. Every record carries a `spaceId` from day one: v1 shows one space ("your library"), but adding a second profile later needs no migration.

| Store | Key | Fields | Indexes |
| --- | --- | --- | --- |
| `spaces` | `id` | name, tagline, createdAt | none |
| `categories` | `id` | spaceId, name, color, icon, order, createdAt | `spaceId`, `[spaceId+order]` |
| `resumes` | `id` | spaceId, categoryId, title, version, headline, summary, skills\[\], tailoredFor, spineColor, pinned, fileName, mimeType, sizeBytes, pageCount, createdAt, updatedAt, lastDownloadedAt, downloadCount | `spaceId`, `categoryId`, `updatedAt`, `*skills` |
| `files` | `resumeId` | blob, sha256 | none |
| `textIndex` | `resumeId` | extractedText | none |
| `meta` | `key` | value (theme, lastBackupAt, schemaVersion, filenameTemplate) | none |

Rules the code must follow:

- Ids are UUIDs created in the app (`crypto.randomUUID()`), never auto-increment, so backups merge cleanly.
- Deleting a category with books in it is blocked until they are moved or deleted.
- Deleting a resume removes its `files` and `textIndex` rows in one Dexie transaction.
- Schema changes go through numbered Dexie versions with an upgrade function. Never edit a shipped version.
- A backup stores `schemaVersion`. Import validates with Zod and migrates older backups forward.

## Architecture

The app is layered with dependencies running one way, so all data code sits in one place and the UI can be rebuilt without touching it. The exact folder structure and interfaces are in the prompt below.

&#91;embedded content: layered architecture · 4 layers plus a shared domain\]

Features read data through storage hooks and call services for file work; both rely on the pure domain layer. Because only storage imports Dexie, adding sync or swapping the database later changes one folder.

## UI and UX spec

The home screen is the shelf: a stack of shelves, one per category, each holding book spines. Everything else (preview, edit, upload) happens in a drawer or dialog on top of it, so you never lose your place.

| Interaction | Behavior |
| --- | --- |
| Book spine | Vertical spine with the title rotated along it. Color comes from the resume (curated palette of 8 muted tones). Height varies slightly by page count. A pinned book shows a ribbon. |
| Hover or keyboard focus | Book lifts 8px; a card opens after 120 ms showing title, version, headline, 2 to 3 line summary, top 5 skill chips, tailored-for, updated date, size and download count. The card flips at screen edges and never flickers when the pointer moves onto it. |
| Click or Enter | Opens a right-side drawer (bottom sheet on mobile) with a first-page preview and a large **Download** button. Also: Edit details, Replace file, Move to shelf, Duplicate, Pin, Delete (confirm dialog). |
| Quick download | `Shift+Enter` on a focused book or search result downloads immediately. File name comes from a template, default `{name}_{shelf}_{version}.pdf`. |
| Add resume | Drop a file anywhere (full-page "Drop to add" overlay), or use the ghost "+" book at the end of a shelf. The dialog pre-fills title from the file name, shelf from where you dropped, and suggested skills from the PDF text. |
| Search | `/` or `Cmd/Ctrl+K` opens a palette that searches title, headline, skills, tailored-for and the extracted text, grouped by shelf. |
| Shelves | Rename inline, pick a color, drag to reorder, drag a book to another shelf, collapse. Blocked deletion explains why. |
| First run | Welcome screen offers starter shelves (Data Analyst, AI/ML Engineer, Full-Stack Developer, Python/Backend Developer) to keep, rename or skip. |
| Backup | Header menu: Export backup (.zip), Import backup, last backup date. A banner appears after 14 days without a backup. |

**Look and feel.** Warm library tone, not a generic dashboard: paper background (`#F6F3EE`), dark walnut shelf lines, serif titles (Fraunces) with Inter for UI, both self-hosted through `@fontsource` so the app makes no external requests. Dark mode follows the system and has a manual toggle. Use design tokens (CSS variables) for every color and radius.

**Accessibility and touch.**

- Every book is a real `button` with an `aria-label` (title, shelf, updated date). Arrow keys move along a shelf.
- The hover card is a convenience, never the only path: all the same content is in the drawer.
- On touch devices there is no hover; a tap opens the drawer. Tap targets are at least 44px.
- `prefers-reduced-motion` turns off lift and tilt animations.

**Empty, loading and error states** are designed, not left blank: empty shelf ("Drop a resume here"), unreadable PDF (still saves, skips extraction, tells you), storage full or blocked (clear message plus an export prompt), private-browsing mode (warns that data will not persist).

## Features by release

The MVP covers everything you described plus the safety net (backup) and search that make it usable every day. The rest waits until the MVP has survived a real week of job hunting.

| Feature | Release |
| --- | --- |
| Shelves (categories): create, rename, color, reorder, delete with guard | MVP |
| Upload PDF or DOCX by drag and drop, with title, version, headline, summary, skills | MVP |
| Book spines, hover card, click-to-open drawer with first-page preview | MVP |
| One-click download with filename template; replace file; move between shelves; duplicate; pin | MVP |
| Search palette over metadata and PDF text; `Shift+Enter` quick download | MVP |
| Skill suggestions from PDF text (keyword dictionary, no AI service) | MVP |
| Backup export and import (zip), 14-day reminder, persistent-storage request | MVP |
| Dark mode, responsive layout, keyboard and screen-reader support | MVP |
| Installable PWA that works offline | MVP |
| Sent log: which resume you sent to which company and when | v1.1 |
| Version history per resume (keep previous files) | v1.1 |
| Space switcher (more than one profile) | v1.1 |
| Automatic backup to a chosen folder (File System Access API, Chromium only) | v1.1 |
| Optional sync through a free-tier service behind the storage interface | Later |
| Summary drafting with your own AI key stored only in the browser | Later |

## Build plan

Seven phases, about 6 to 8 working days with an agent doing the typing and you reviewing each phase. Do not start a phase until the previous one's check passes. Data layer comes before UI on purpose: it is the part that must never lose your files.

| Phase | Scope | Done when |
| --- | --- | --- |
| 0. Setup | Vite, React, strict TypeScript, ESLint, Prettier, Tailwind, Vitest, `vercel.json`; deploy a placeholder page | Placeholder is live on a Vercel URL; `lint`, `test`, `build` all pass |
| 1. Data layer | Dexie schema, repositories, Zod schemas, backup service, seed data, tests on `fake-indexeddb` | Tests prove CRUD, cascade delete, and export, wipe, import round trip |
| 2. Shelf UI | Layout, shelves, book spines, hover card, category management, first-run starter shelves | Seeded shelf works with mouse, keyboard and a 375px-wide screen |
| 3. Upload and drawer | Drop zone, upload dialog, drawer with preview, download with filename template, edit, replace, move, delete | Playwright test: upload, hover shows summary, click, download returns the same bytes |
| 4. Search and extraction | Lazy `pdfjs-dist`, text and skill suggestions, search palette, quick download | Searching a word that appears only inside a PDF finds that resume |
| 5. Safety and polish | `storage.persist()`, backup banner, PWA with offline support, empty and error states, accessibility pass | Lighthouse 90+ in all four categories; installs on your phone; works with network off |
| 6. Ship | Push to GitHub, import to Vercel, optional custom domain | Production URL works; a backup exported from production imports cleanly on localhost |

**Deploying to Vercel (no backend):**

1. Push the repo to GitHub.
2. In Vercel, choose New Project, import the repo, framework preset **Vite**.
3. Build command `npm run build`, output directory `dist`. The Hobby plan is enough.
4. Keep `vercel.json` with a rewrite of all routes to `/index.html`, or deep links will 404.
5. After the first deploy, open the site on every device you use, import your backup, and install it to the home screen.

## Prompt for your coding agent

Paste everything in the block below as the first message to Claude Code, Cursor or any coding agent, in an empty repository. It is self-contained and makes the agent work phase by phase, stopping for your review after each one.

```markdown
# ROLE
You are a senior front-end engineer building 'Resume Shelf', a personal tool I will use every day while job hunting. Quality bar: production-grade, typed, tested and maintainable. This is not a demo or a prototype.

# PRODUCT
A static single-page web app that stores my resumes on a visual bookshelf. One shelf per job type (for example Data Analyst, AI/ML Engineer). Each resume is a book spine. Hovering a book shows a summary card. Clicking it opens a drawer with a preview and a Download button. I add resumes by dropping a file onto a shelf.

# HARD CONSTRAINTS
1. No backend, no serverless functions, no third-party APIs, no analytics. After the app loads it makes no network requests. Output is static files for Vercel (Vite preset, output directory dist).
2. All data is stored in the browser with IndexedDB through Dexie. Files are stored as Blobs.
3. Data loss is the worst possible bug. Every write goes through the storage layer inside a Dexie transaction. Backup export followed by import must round-trip exactly.
4. TypeScript strict. No any. No unexplained non-null assertions.
5. Do not add libraries beyond the stack below without asking me first.

# STACK
Vite, React 19, TypeScript, React Router, Tailwind CSS, Radix UI primitives, Framer Motion, @dnd-kit, Dexie and dexie-react-hooks, Zod, pdfjs-dist (dynamic import only), fflate, vite-plugin-pwa, @fontsource/fraunces and @fontsource-variable/inter, Vitest, Testing Library, fake-indexeddb, Playwright, ESLint, Prettier. Use npm.

# ARCHITECTURE RULES
- src/domain: pure TypeScript only (types, Zod schemas, pure functions). No React, no Dexie, no browser APIs. Everything here has unit tests.
- src/storage: the ONLY place that imports dexie. Defines a StorageAdapter interface (repositories for spaces, categories, resumes, files, textIndex, meta, plus a transaction helper) and its Dexie implementation. Also exports React hooks built on useLiveQuery. If sync is ever added, only this folder changes.
- src/services: browser logic with no UI: backup (zip export and import), pdf (text extraction, first-page render), persistence (storage.persist, quota), download (blob to saved file with a sanitized name).
- src/features: one folder per feature with its own components and hooks. Features may use domain, storage and services, never each other's internals.
- src/components/ui: shared presentational primitives. No business logic.
- src/app: router, providers, error boundary, PWA registration.

# FOLDER STRUCTURE
  src/
    app/            router.tsx, providers.tsx, ErrorBoundary.tsx, pwa.ts
    components/ui/  Button, Dialog, Drawer, HoverCard, Toast, Tooltip, Input, Textarea, TagInput, ColorPicker
    domain/         types.ts, schemas.ts, filename.ts, skills.ts, limits.ts
    storage/        adapter.ts, hooks.ts, seed.ts, dexie/db.ts, dexie/repositories.ts
    services/       backup.ts, pdf.ts, persistence.ts, download.ts
    features/
      shelf/        ShelfPage, Shelf, Book, BookHoverCard, AddBookSlot
      categories/   CategoryDialog, useCategoryActions
      upload/       DropOverlay, UploadDialog
      drawer/       ResumeDrawer, PdfPreview, ResumeActions
      search/       CommandPalette, searchIndex.ts
      backup/       BackupMenu, BackupBanner
      onboarding/   WelcomeStarterShelves
      settings/     SettingsDialog
    styles/         tokens.css, globals.css
    main.tsx
  e2e/              Playwright specs
  docs/             DECISIONS.md
  vercel.json, vite.config.ts

# DATA MODEL (src/domain/types.ts)
  type ID = string  // crypto.randomUUID()
  interface Space { id: ID; name: string; tagline?: string; createdAt: number }
  interface Category { id: ID; spaceId: ID; name: string; color: string; icon?: string; order: number; createdAt: number }
  interface Resume { id: ID; spaceId: ID; categoryId: ID; title: string; version?: string; headline: string; summary: string; skills: string[]; tailoredFor?: string; spineColor: string; pinned: boolean; fileName: string; mimeType: string; sizeBytes: number; pageCount?: number; createdAt: number; updatedAt: number; lastDownloadedAt?: number; downloadCount: number }
  interface ResumeFile { resumeId: ID; blob: Blob; sha256: string }
  interface TextIndexEntry { resumeId: ID; extractedText: string }
  interface MetaEntry { key: string; value: unknown }

Dexie version 1 stores:
  spaces: id
  categories: id, spaceId, [spaceId+order]
  resumes: id, spaceId, categoryId, updatedAt, *skills
  files: resumeId
  textIndex: resumeId
  meta: key
Use numbered versions with upgrade functions. Never edit a shipped version. Every record has spaceId; v1 UI shows a single space.

# BUSINESS RULES
- Limits: headline 80 chars, summary 280 chars, up to 12 skills of 30 chars each, file size 10 MB. Accept PDF and DOCX only.
- DOCX is stored and downloadable but has no preview or text extraction; the drawer shows a file card instead.
- Deleting a category that still has resumes is blocked; explain why and offer to move them.
- Deleting a resume removes its files and textIndex rows in one transaction, after a confirm dialog.
- Download filename template tokens: {name} {shelf} {version} {title} {date}. Default {name}_{shelf}_{version}. Sanitize to letters, digits, dot, dash, underscore. Keep the original extension. Each download updates lastDownloadedAt and downloadCount.
- Spine color defaults deterministically from the resume id over a curated palette of 8 muted colors. The user can override it.
- Skill suggestions: keyword dictionary in domain/skills.ts (about 200 common tech and data skills with aliases). Suggest dictionary terms found in the extracted text, ranked by frequency, top 12. The user confirms; nothing is added automatically.
- Search runs client-side over title, headline, summary, skills, tailoredFor and extracted text. Case-insensitive, prefix-friendly, grouped by shelf. Load the text index lazily on first search.
- Backup zip contains manifest.json (app: 'resume-shelf', schemaVersion, exportedAt, spaces, categories, resumes, settings) and files/<resumeId>.<ext>. The text index is not exported; rebuild it after import. Import validates with Zod, migrates older schema versions forward, and offers Merge (by id, newer updatedAt wins) or Replace all (with confirm).
- On first load call navigator.storage.persist() and show a quiet notice if denied. Show a banner when there has been no backup for 14 days. Warn in private browsing that data will not persist.

# UI SPEC
- Home is the shelf page. Header: space name, search button, Add resume, Backup menu, theme toggle. Below it, one shelf per category with a label plate (name, count, color), a row of book spines on a shelf line, and a ghost '+' book at the end.
- Book: vertical spine with the title rotated along it, height varying slightly with page count, ribbon if pinned. It is a real button element.
- Hover or focus (120 ms delay): the book lifts 8px and a card opens with title, version, headline, summary, top 5 skill chips, tailored-for, updated date, size and download count. Use Radix HoverCard so it flips at screen edges and does not flicker. On touch there is no hover: a tap opens the drawer.
- Click or Enter: right-side drawer (bottom sheet under 640px) with first-page preview (pdf.js, lazy), a large Download button, and actions Edit details, Replace file, Move to shelf, Duplicate, Pin, Delete.
- Shift+Enter on a focused book or search result downloads immediately.
- Add: drop a file anywhere (full-page overlay) or use the '+' book. The dialog pre-fills title from the file name, shelf from the drop target, and suggested skills from the PDF text. Fields: title, shelf (with inline 'New shelf'), version, headline, summary, skills, tailored-for.
- Search palette opens on '/' or Cmd/Ctrl+K. Enter opens the drawer.
- Shelves: rename inline, pick color, drag to reorder, drag a book to another shelf, collapse.
- First run: welcome screen offering starter shelves (Data Analyst, AI/ML Engineer, Full-Stack Developer, Python/Backend Developer) to keep, rename or skip.
- Visual style: warm library feel. Paper background #F6F3EE, dark walnut shelf lines, Fraunces for titles, Inter for UI, both self-hosted. Dark mode follows the system with a manual toggle. All colors and radii are CSS variable tokens in styles/tokens.css. Avoid generic purple gradients and default component-library looks.
- Every async action has loading, success and error states. Errors appear in a toast with a clear message. Nothing fails silently.
- Design these states properly: empty shelf, unreadable PDF (still saves, skips extraction, tells me), storage full or blocked, private browsing.

# QUALITY RULES
- Small components, no file over 250 lines, clear names, no dead code.
- Accessibility: everything keyboard reachable, visible focus, aria labels, prefers-reduced-motion respected, axe checks in Playwright.
- Performance: lazy-load pdfjs and the drawer; initial JS under 200 KB gzipped excluding pdfjs. Revoke object URLs after use.
- Privacy: no remote fonts or scripts. Never render file-derived text as HTML.
- Tests: unit tests for domain and storage (fake-indexeddb); component tests for the hover card and upload dialog; three Playwright flows: (1) add a resume, hover shows its summary, download returns identical bytes; (2) search finds a word that exists only inside a PDF; (3) export backup, clear the database, import, everything restored.
- Git: one commit per logical step with conventional commit messages. Keep docs/DECISIONS.md updated: when something is ambiguous, choose the simplest option that satisfies the constraints and record it there.

# WORKFLOW
Work in 7 phases. Start by replying with a short plan and any blocking questions (maximum 5), then implement Phase 0 only.
  0 Setup: scaffold, tooling, vercel.json SPA rewrite, placeholder page deployed.
  1 Data layer: domain types and schemas, Dexie schema and repositories, backup service, seed data, tests.
  2 Shelf UI: layout, shelves, books, hover card, category management, first-run.
  3 Upload and drawer: drop zone, dialog, drawer, download, edit, replace, move, delete.
  4 Search and extraction: pdf.js text and skills, palette, quick download.
  5 Safety and polish: persist(), backup banner, PWA offline, empty and error states, accessibility pass.
  6 Ship: Vercel deploy notes, README with backup and restore instructions.
After each phase run lint, typecheck, tests and build. Summarize what changed and what I should check by hand, then STOP and wait for me to say 'next'. Never start the next phase on your own.

# DEFINITION OF DONE
Lint, typecheck, unit tests, Playwright tests and build all pass. Lighthouse 90+ in all four categories. The app works with the network off after first load. A backup exported from the deployed site imports cleanly in a fresh browser profile.
```

## Growing it later, and known limits

The `StorageAdapter` interface is the seam for growth. Features only talk to that interface, so a different storage backend can replace Dexie without changing any UI code.

**Upgrade path, cheapest first:**

1. Keep the backup zip in Google Drive or email it to yourself. This covers most cross-device needs at zero cost.
2. Add automatic backup to a chosen folder (v1.1, Chromium browsers only).
3. Add a cloud adapter (for example a free-tier Supabase project or Google Drive app data). Writes stay local first and sync in the background. Check the provider's current free-tier terms before relying on it, since idle projects can be paused.

**Limits to know about:**

- No cross-device sync in v1. Each browser has its own library until you import a backup.
- Browser storage is generous for this use: a typical resume PDF is a few hundred KB, so 100 resumes is tens of MB.
- Your resumes contain personal details. The app sends nothing anywhere, but anyone who can open your browser profile can read them. Optional passphrase encryption (Web Crypto) is a sensible later addition.
- Deleting a book is permanent. The backup is your undo.
