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
