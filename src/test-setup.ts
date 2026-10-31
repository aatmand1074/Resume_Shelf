import '@testing-library/jest-dom'

// In Vitest jsdom environment:
// jsdom provides a window.Blob that is NOT an instance of Node's native Blob,
// causing Node's global `structuredClone` (called by fake-indexeddb) to serialize it as `{}`.
// We intercept structuredClone to properly preserve Blobs during fake-indexeddb transactions.
const originalStructuredClone = globalThis.structuredClone

globalThis.structuredClone = function <T>(val: T, options?: StructuredSerializeOptions): T {
  if (val && typeof val === 'object') {
    // If val is a Blob or contains a Blob, preserve it
    if ('blob' in val && (val as { blob: unknown }).blob instanceof Blob) {
      const obj = val as { blob: Blob; [key: string]: unknown }
      const cloned = originalStructuredClone(
        { ...obj, blob: undefined },
        options
      ) as unknown as Record<string, unknown>
      cloned.blob = obj.blob
      return cloned as T
    }
    if (val instanceof Blob) {
      return val
    }
  }
  return originalStructuredClone(val, options)
}
