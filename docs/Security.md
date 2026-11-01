# Resume Shelf — Security & Privacy Architecture

## 1. Threat Model & Privacy Guarantees
Resume Shelf is designed for individuals to store sensitive career, educational, contact, and compensation data without third-party exposure.

### Core Security Guarantees
1. **Zero External Network Exfiltration**:
   - The application does not communicate with external APIs, telemetry servers, or analytics endpoints after load.
   - Fonts (`Fraunces` and `Inter`) are bundled and served locally via `@fontsource`.
2. **Local Browser Isolation**:
   - Resumes, full-text indexes, and metadata reside entirely within browser IndexedDB storage protected by the browser's Same-Origin Policy (SOP).
3. **No Dynamic Code Execution**:
   - No `eval()`, `Function()`, or dynamic script injection is used.
   - Extracted PDF strings are treated strictly as plain text, never rendered using `dangerouslySetInnerHTML`.

---

## 2. Input Sanitization & File Validation

### 2.1 File Ingestion Constraints
- **MIME Types**: Whitelisted to `application/pdf` and `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX).
- **Max File Size**: Enforced at `10 MB` by default via `src/domain/limits.ts` and `appConfig.MAX_FILE_SIZE_BYTES`.
- **Integrity**: Files store SHA-256 digests (`crypto.subtle.digest('SHA-256', ...)`) to ensure backup integrity and deduplication.

### 2.2 Filename Sanitization
Filenames generated during downloads or imports are sanitized via [`sanitizeFilenamePart()`](file:///e:/Project/R3sumeShelf/src/domain/filename.ts):
- Replaces path traversal sequences (`../`, `..\\`) and illegal characters with underscores.
- Restricts tokens strictly to letters, numbers, hyphens, dots, and underscores (`[\w.-]+`).

---

## 3. Data Protection in the Browser

### 3.1 Browser Eviction Prevention
Browsers may evict IndexedDB contents during storage pressure or private browsing. Resume Shelf mitigates this by:
- Calling `navigator.storage.persist()` on launch.
- Detecting private browsing mode and displaying a warning banner.
- Providing 14-day export reminders to encourage regular local backups.

### 3.2 Backup Archive Verification
- Backups are encrypted or plain ZIPs containing `manifest.json`.
- Before import, `manifest.json` is strictly validated through `manifestSchema.parse()` (Zod) to prevent malformed or malicious payload injections.

---

## 4. Content Security Policy (CSP) Recommendation
When deploying to production hosting (e.g. Vercel), the following CSP header configuration should be applied:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self' blob:; object-src 'none'; frame-ancestors 'none';
```
