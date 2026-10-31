export type ID = string // crypto.randomUUID()

export interface Space {
  id: ID
  name: string
  tagline?: string
  createdAt: number
}

export interface Category {
  id: ID
  spaceId: ID
  name: string
  color: string
  icon?: string
  order: number
  createdAt: number
}

export interface Resume {
  id: ID
  spaceId: ID
  categoryId: ID
  title: string
  version?: string
  headline: string
  summary: string
  skills: string[]
  tailoredFor?: string
  spineColor: string
  pinned: boolean
  fileName: string
  mimeType: string
  sizeBytes: number
  pageCount?: number
  createdAt: number
  updatedAt: number
  lastDownloadedAt?: number
  downloadCount: number
}

export interface ResumeFile {
  resumeId: ID
  blob: Blob
  sha256: string
}

export interface TextIndexEntry {
  resumeId: ID
  extractedText: string
}

export interface MetaEntry {
  key: string
  value: unknown
}

export const SPINE_PALETTE = [
  'var(--spine-0)',
  'var(--spine-1)',
  'var(--spine-2)',
  'var(--spine-3)',
  'var(--spine-4)',
  'var(--spine-5)',
  'var(--spine-6)',
  'var(--spine-7)',
] as const

export function getDefaultSpineColor(id: ID): string {
  // deterministic color from id
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return SPINE_PALETTE[hash % SPINE_PALETTE.length]
}
