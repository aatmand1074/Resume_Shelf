# Resume Shelf — Code Style & Engineering Standards

## 1. Tooling & Linters
- **TypeScript**: Strict mode enabled (`tsconfig.json` & `tsconfig.node.json`). No `any`, no implicit casts, no unexplained non-null assertions (`!`).
- **ESLint**: ESLint 9+ flat configuration (`eslint.config.js`) paired with `@typescript-eslint` recommended type-checked rules.
- **Prettier**: Consistent formatting with single quotes, semicolons omitted where safe, and `prettier-plugin-tailwindcss` for class ordering.

---

## 2. Naming Conventions

### 2.1 Files & Directories
- **React Components**: PascalCase (e.g., `ShelfPage.tsx`, `CategoryDialog.tsx`, `BookHoverCard.tsx`).
- **Hooks**: camelCase with `use` prefix (e.g., `useCategoryActions.ts`, `useLiveQuery`).
- **Services & Modules**: camelCase (e.g., `download.ts`, `resumeApi.ts`, `persistence.ts`).
- **Types & Schemas**: camelCase (e.g., `types.ts`, `schemas.ts`, `limits.ts`).
- **Styles**: kebab-case or lowercase (e.g., `tokens.css`, `globals.css`).

### 2.2 Variables & Functions
- **Variables**: camelCase describing intent (e.g., `activeSpaceId`, `downloadCount`).
- **Boolean Variables**: Prefixed with `is`, `has`, `should`, or `can` (e.g., `isPersisted`, `hasError`, `canDelete`).
- **Constants**: UPPER_SNAKE_CASE for global constants (e.g., `DEFAULT_SPACE_ID`, `SPINE_PALETTE`).
- **Functions & Methods**: Verb-first camelCase (e.g., `saveCategory()`, `downloadResumeFile()`, `extractPdfMetadata()`).

---

## 3. Component Architecture & Rules
1. **Component Size**: Keep components focused. Break any component exceeding 200 lines into sub-components.
2. **Presentational vs. Container**:
   - Presentational components in `src/components/ui/` remain pure and logic-free.
   - Business state transitions and database mutations are extracted into custom hooks (e.g., `useCategoryActions.ts`) or service clients (`resumeApi`).
3. **Props Typing**: Always define explicit interfaces for component props (e.g., `interface ShelfProps { ... }`). Avoid inline anonymous types.
4. **Event Handlers**: Explicitly type React synthetic events:
   ```typescript
   const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>): void => {
     e.preventDefault();
     // ...
   };
   ```

---

## 4. Error Handling Guidelines
1. **Never Fail Silently**: All async workflows must provide catch blocks, logging unexpected errors and presenting readable notices or toast alerts to the user.
2. **Standardized API Envelopes**: Services return `{ success: true, data }` or `{ success: false, error: { code, message, details } }`.
3. **Input Validation**: Validate inputs at boundary layers using Zod schemas (`src/domain/schemas.ts`) before executing writes.
4. **Error Boundary**: Wrap critical interactive subtrees in [`ErrorBoundary`](file:///e:/Project/R3sumeShelf/src/app/ErrorBoundary.tsx) to provide graceful fallback screens and reset triggers.
