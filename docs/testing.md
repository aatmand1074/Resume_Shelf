# Resume Shelf — Testing Strategy & Quality Assurance

## 1. Testing Philosophy & Test Pyramid
Resume Shelf enforces a multi-tier testing strategy to ensure zero data loss, rock-solid schema migrations, and accessible UI interactions.

```
       /  Playwright E2E Tests  \       <- 3 Critical Workflows
      / Component & Hook Tests   \      <- HoverCards, Dialogs, Actions
     / Unit Tests (Domain & API)  \     <- Zod Schemas, Filename, Skills, Services
    /  Storage Integration Tests   \    <- Dexie on fake-indexeddb
```

---

## 2. Test Execution Commands

```bash
# Run Vitest unit & integration test suite once
npm test

# Run Vitest in interactive watch mode
npm run test:watch

# Run test suite with V8 code coverage report
npm run test:coverage

# Run Playwright End-to-End browser tests
npm run test:e2e
```

---

## 3. Test Suites Overview

### 3.1 Domain & Pure Unit Tests
- **Location**: `src/domain/*.test.ts`
- **Scope**:
  - `types.test.ts`: Palette token verification and deterministic color hashing.
  - Filename template token replacement and edge case sanitization (`filename.ts`).
  - Skill suggestion dictionary matching (`skills.ts`).

### 3.2 Storage Integration Tests
- **Location**: `src/storage/storage.test.ts`
- **Environment**: Tested on `fake-indexeddb` with isolated in-memory DB instances.
- **Critical Invariants Tested**:
  - Initial space & starter shelf seeding.
  - Resume CRUD operations with binary Blobs.
  - Category deletion block when resumes exist.
  - Atomic cascade deletion (deleting a resume wipes its `files` and `textIndex` records in one transaction).
  - Backup ZIP export and import round-trip data restoration.

### 3.3 Service & API Layer Tests
- **Location**: `src/services/api/api.test.ts`
- **Scope**:
  - Request validation and Zod issue translation.
  - `ApiResponse<T>` error and success structure.
  - Download stat increments and safe record deletion.

### 3.4 Playwright End-to-End Core Flows
Configured in `playwright.config.ts` covering 3 core daily workflows:
1. **Resume Ingestion & Download Flow**: Drag-and-drop a sample PDF, inspect the rendered hover card, click to open the drawer, and verify downloaded bytes match the uploaded file.
2. **Text Index Search Flow**: Verify that typing a keyword found only inside the PDF body locates and highlights the resume on the shelf.
3. **Backup & Disaster Recovery Flow**: Seed resumes, export the backup archive, wipe IndexedDB, import the archive, and verify all shelves and resumes are restored.
