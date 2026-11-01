# Resume Shelf — System Architecture

## 1. High-Level Architectural Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
│   src/app/ (Router, Providers, ErrorBoundary)               │
│   src/features/ (shelf, categories, drawer, upload, search) │
│   src/components/ui/ (Button, Dialog, Drawer, TagInput...)  │
└──────────────┬──────────────────────────────┬───────────────┘
               │ Reactive Query Hooks         │ Service Calls
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│         Storage Layer        │ │       Service Layer        │
│   src/storage/hooks.ts       │ │   src/services/api/        │
│   (useLiveQuery reactive)    │ │   src/services/download.ts │
│   src/storage/dexie/         │ │   src/services/backup.ts   │
│   (db.ts, repositories.ts)   │ │   src/services/pdf.ts      │
└──────────────┬───────────────┘ └────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Domain Layer                        │
│   src/domain/ (types.ts, schemas.ts, filename.ts, skills.ts) │
│   * 100% Pure TypeScript. No React, No Dexie, No Browser APIs│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Architectural Boundaries & Dependencies

| Layer | Path | Allowed Dependencies | Prohibited Dependencies |
| :--- | :--- | :--- | :--- |
| **Domain** | `src/domain/` | Pure TypeScript, Zod | React, Dexie, DOM, Browser APIs |
| **Storage** | `src/storage/` | Domain, Dexie, dexie-react-hooks | UI components, Feature modules |
| **Services** | `src/services/` | Domain, Storage, Browser APIs, fflate, pdfjs | React UI, Feature modules |
| **UI Components** | `src/components/ui/` | Tailwind, Radix UI primitives, Lucide icons | Domain writes, Dexie, Storage |
| **Features** | `src/features/` | Domain, Storage hooks, Services, UI Primitives | Other features' private internals |
| **App** | `src/app/` | Features, Services, UI Primitives | Direct Dexie queries |

---

## 3. Storage Layer & Reactivity Pattern

Resume Shelf deliberately avoids external global state managers (such as Redux or Zustand). Instead:
1. **Source of Truth**: The IndexedDB database acts as the single source of truth.
2. **Reactivity**: Features read through Dexie's `useLiveQuery` hooks (`useCategories`, `useResumes`, `useSpaces`). Whenever any write occurs, IndexedDB notifies subscribers, triggering component re-renders automatically.
3. **Atomic Writes**: Multi-entity mutations (e.g., deleting a resume alongside its binary blob and text index) execute inside single Dexie transactions.

---

## 4. API & Service Architecture

All interactions requiring external browser APIs or storage writes go through modular services:
- **`src/services/api/`**: Encapsulates data validation via Zod schemas, returning typed `ApiResponse<T>` envelopes with standard error handling.
- **`src/services/pdf.ts`**: Dynamically imports `pdfjs-dist` only when requested, ensuring the initial bundle stays light.
- **`src/services/backup.ts`**: Streamlined client-side ZIP packaging and unzipping using `fflate`.
- **`src/services/download.ts`**: Encapsulates file download naming templates and updates usage statistics.

---

## 5. Offline & PWA Strategy
The app uses `vite-plugin-pwa` with `generateSW`. The Service Worker caches HTML, CSS, JavaScript, self-hosted fonts, and application icons. Once loaded, Resume Shelf functions completely offline without internet connectivity.
