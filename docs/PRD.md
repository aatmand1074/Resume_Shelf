# Resume Shelf — Product Requirements Document (PRD)

## 1. Product Overview
**Resume Shelf** is a local-first, static single-page web app that organizes every version and variation of a job seeker's resume on a visual bookshelf. Each shelf represents a career path or discipline (e.g., *Data Analyst*, *AI/ML Engineer*, *Full-Stack Developer*), and each resume is visually represented as a distinct book spine.

### Primary Goals
- **Instant Access (< 5 seconds)**: Locate, preview, and download the exact resume tailored for a specific role or company during recruiter calls.
- **Zero Backend / Zero Maintenance Cost**: Hosted purely on static infrastructure (Vercel free tier) without databases to manage or serverless costs.
- **Local Data Sovereignty**: 100% of files, extracted text, and metadata remain in browser storage (IndexedDB). No analytics, no third-party tracking.
- **Bulletproof Safety & Zero Data Loss**: One-click ZIP backup and restore round-trip, storage persistence requests, and proactive 14-day export reminders.

---

## 2. Target Audience & Personas
- **Multi-Role Job Seekers**: Candidates applying across adjacent fields (e.g., Data Engineer vs. Backend Developer) needing fast switching between tailored resume files.
- **Freelancers & Consultants**: Professionals maintaining customized CVs tailored to specific client domains or skill stacks.
- **Privacy-Conscious Professionals**: Candidates who prefer keeping sensitive career history, contact information, and documents local to their own hardware.

---

## 3. Core Features & Scope

### 3.1 Shelves (Categories)
- Create, rename, color-code, reorder, and collapse shelves.
- **Safety guard**: Deleting a category that contains resumes is strictly blocked; users are guided to move or delete resumes first.
- **First-run starter shelves**: Onboarding offers pre-configured starter shelves (*Data Analyst*, *AI/ML Engineer*, *Full-Stack Developer*, *Python/Backend Developer*).

### 3.2 Book Spines & Interaction
- **Spine rendering**: Vertical book spines with rotated typography, height modulated by page count, ribbon badge for pinned resumes, and deterministic muted palette colors.
- **Hover / Focus card**: Lifts 8px on hover/focus (120ms delay), displaying role headline, summary, top 5 skill chips, company tailored for, last updated date, and download count.
- **Keyboard navigation**: Real `<button>` spines, arrow key focus, and `Shift+Enter` quick download.

### 3.3 Resume Drawer & Preview
- **Drawer**: Desktop right slide-out panel / mobile bottom sheet.
- **PDF Preview**: First-page canvas preview rendered on-demand via `pdfjs-dist` (lazy loaded).
- **DOCX Fallback**: Non-PDF formats display a stylized file card.
- **Actions**: One-click download, metadata editing, file replacement, moving shelves, duplicating, pinning, and deletion.

### 3.4 File Ingestion & Parsing
- **Drag-and-Drop**: Full-page drop overlay and inline shelf "+" drop slots.
- **Skill Suggestions**: Client-side keyword dictionary (~200 technical & data skills) scanning extracted text and suggesting ranked chips. User confirms all additions.

### 3.5 Client-Side Search
- **Command Palette (`/` or `Cmd/Ctrl+K`)**: Instant fuzzy search across titles, headlines, summaries, skill tags, company names, and extracted PDF full text.

### 3.6 Backup & Data Preservation
- **ZIP Export**: Generates `resume-shelf-backup-YYYY-MM-DD.zip` containing `manifest.json` and raw resume binaries.
- **ZIP Import**: Validates format with Zod, supports **Replace All** and **Merge** (by ID, newer timestamp wins).
- **Storage Persistence**: Invokes `navigator.storage.persist()` on launch.

---

## 4. Non-Functional Requirements
- **Performance**: Initial JavaScript bundle < 200 KB gzipped (excluding lazy `pdfjs-dist`). Lighthouse 90+ across all 4 categories.
- **Accessibility**: Full keyboard navigability, visible focus rings, ARIA labels, `prefers-reduced-motion` compliance.
- **Offline / PWA**: Installable web app with Service Worker caching for complete offline functionality.
- **Code Quality**: Strict TypeScript, zero `any`, automated unit tests (Vitest) and end-to-end tests (Playwright).
