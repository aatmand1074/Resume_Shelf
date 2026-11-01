# Resume Shelf — Database Architecture & IndexedDB Schema

## 1. Storage Engine
Resume Shelf uses **IndexedDB** managed through the **Dexie.js** library (`ResumeShelfDB`).
- **Database Name**: Configurable via `appConfig.DEFAULT_STORAGE_NAME` (default: `'ResumeShelfDB'`).
- **Binary Support**: Large PDF/DOCX files are stored natively as browser `Blob` objects.
- **Separation of Blobs**: Resumes metadata and binary blobs are stored in separate tables (`resumes` vs. `files`), ensuring shelf views remain lightweight without loading binary files into memory.

---

## 2. Table Specifications & Indexes

| Table Name | Primary Key | Stored Fields | Dexie Index String | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `spaces` | `id` (UUID) | `name`, `tagline`, `createdAt` | `id` | Multi-profile boundary (default space: `'default-space'`). |
| `categories` | `id` (UUID) | `spaceId`, `name`, `color`, `icon`, `order`, `createdAt` | `id, spaceId, [spaceId+order]` | Job role shelves. Indexed by space and display order. |
| `resumes` | `id` (UUID) | `spaceId`, `categoryId`, `title`, `version`, `headline`, `summary`, `skills[]`, `tailoredFor`, `spineColor`, `pinned`, `fileName`, `mimeType`, `sizeBytes`, `pageCount`, `createdAt`, `updatedAt`, `lastDownloadedAt`, `downloadCount` | `id, spaceId, categoryId, updatedAt, *skills` | Core resume metadata and tags. Multikey indexed on `*skills`. |
| `files` | `resumeId` (UUID) | `blob`, `sha256` | `resumeId` | Binary file storage. Isolated to prevent memory bloat during shelf rendering. |
| `textIndex` | `resumeId` (UUID) | `extractedText` | `resumeId` | Extracted full-text content used for search and skill extraction. |
| `meta` | `key` (string) | `value` | `key` | Key-value store for app settings, theme, and backup metadata. |

---

## 3. Data Integrity & Cascade Rules

1. **UUID Generation**: All primary keys are generated client-side using `crypto.randomUUID()`. Auto-incrementing numbers are never used, allowing seamless backup merges across instances.
2. **Category Deletion Guard**:
   ```typescript
   const count = await db.resumes.where('categoryId').equals(id).count();
   if (count > 0) throw new Error("Cannot delete category with resumes.");
   ```
3. **Cascade Resume Deletion**:
   Deleting a resume runs inside a single atomic transaction:
   ```typescript
   await db.transaction('rw', [db.resumes, db.files, db.textIndex], async () => {
     await db.resumes.delete(id);
     await db.files.delete(id);
     await db.textIndex.delete(id);
   });
   ```

---

## 4. Schema Versioning & Migrations
- Current schema version: `1`.
- Any subsequent modifications must declare version incrementation (`db.version(2).stores(...)`) accompanied by an explicit `.upgrade()` transformer function.
- **Never modify existing shipped versions in `src/storage/dexie/db.ts`**.

---

## 5. Backup & Restore Format
Backups are packaged as a `.zip` archive containing:
- `manifest.json`: Validated by `manifestSchema` (Zod), containing exported spaces, categories, resumes, and app settings.
- `files/<resumeId>.<ext>`: Raw binary resume files.
- The `textIndex` table is omitted from backups to minimize archive size; it is dynamically regenerated upon import or first search.
