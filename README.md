# Resume Shelf 📚

A local-first visual bookshelf for organizing resume versions. Zero backend, zero network requests after load — all data lives in your browser's IndexedDB.

**[Live Demo →](https://resume-shelf.vercel.app)**

---

## Features

- **Visual bookshelf UI** — resumes displayed as color-coded book spines grouped by shelf (role/industry)
- **Upload PDF or DOCX** — drag-and-drop anywhere on the page or use the Add Resume button
- **Hover card preview** — see title, headline, skills, and file info on hover; Shift+click to quick-download
- **Full-text search** — command palette (`/` or `Ctrl+K`) searches titles, headlines, summaries, and extracted PDF text
- **Backup & restore** — export your entire library as a `.zip` archive; import merges by ID (newer record wins)
- **14-day backup reminder** — banner prompts you if you haven't backed up recently
- **Onboarding** — first-run dialog to choose starter shelves by role
- **Settings** — edit your library name and tagline
- **Dark mode** — one click, system-token aware
- **Private-browsing detection** — warns when data won't persist
- **Storage-full error handling** — clear error when the browser's quota is exceeded
- **PWA-ready** — offline capable via service worker

---

## Stack

| Layer | Tech |
|---|---|
| UI | React 19 + TypeScript + Tailwind v4 |
| Build | Vite |
| Storage | IndexedDB via Dexie |
| PDF parsing | pdfjs-dist |
| ZIP backup | fflate |
| Components | Radix UI primitives |
| Hosting | Vercel (static) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install & run

```bash
git clone https://github.com/aatmand1074/Resume_Shelf.git
cd Resume_Shelf
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment

No required environment variables. Copy `.env.example` if you want to override defaults:

```bash
cp .env.example .env
```

---

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server at localhost:5173 |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run typecheck` | TypeScript type check only |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Project Structure

```
src/
  app/                  # Entry, providers, router
  features/
    backup/             # Export/import ZIP + reminder banner
    categories/         # Shelf create/edit/delete
    drawer/             # Resume detail drawer + PDF preview
    onboarding/         # First-run welcome dialog
    search/             # Command palette + text index
    settings/           # Library settings dialog
    shelf/              # Bookshelf page, book spine, hover card
    upload/             # Upload dialog + drag-and-drop overlay
  shared/
    components/ui/      # Button, Dialog, Drawer, Input, etc.
  services/             # Backup, download, PDF, persistence
  storage/              # Dexie DB, repositories, hooks, seed
  domain/               # Types, schemas, validation, constants
  styles/               # Global CSS + design tokens
e2e/                    # Playwright E2E tests
```

---

## Data & Privacy

All data is stored in **your browser's IndexedDB**. Nothing is sent to any server. Clearing site data in your browser will erase your library — use the **Backup** feature to keep a portable copy.

---

## Deploying

The app is a static SPA. `vercel.json` already includes the rewrite rule for client-side routing.

```bash
npm run build        # outputs to dist/
# deploy dist/ to any static host
```

For Vercel: connect the GitHub repo and it auto-deploys on push to `main`.

---

## License

MIT
