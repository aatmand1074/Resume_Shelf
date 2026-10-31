import { z } from 'zod'
import { LIMITS } from './limits'

export const idSchema = z.string().min(1)

export const spaceSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(50),
  tagline: z.string().max(100).optional(),
  createdAt: z.number().int().positive(),
})

export const categorySchema = z.object({
  id: idSchema,
  spaceId: idSchema,
  name: z.string().min(1).max(50),
  color: z.string().min(1),
  icon: z.string().max(30).optional(),
  order: z.number().int().nonnegative(),
  createdAt: z.number().int().positive(),
})

export const resumeSchema = z.object({
  id: idSchema,
  spaceId: idSchema,
  categoryId: idSchema,
  title: z.string().min(1).max(100),
  version: z.string().max(20).optional(),
  headline: z.string().max(LIMITS.HEADLINE_MAX),
  summary: z.string().max(LIMITS.SUMMARY_MAX),
  skills: z.array(z.string().min(1).max(LIMITS.SKILL_LENGTH_MAX)).max(LIMITS.SKILLS_MAX),
  tailoredFor: z.string().max(100).optional(),
  spineColor: z.string().min(1),
  pinned: z.boolean(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().refine((val) => (LIMITS.ACCEPTED_MIME as readonly string[]).includes(val), {
    message: 'Unsupported file type. Only PDF and DOCX are accepted.',
  }),
  sizeBytes: z.number().int().positive().max(LIMITS.FILE_SIZE_MAX, {
    message: 'File size exceeds 10 MB limit.',
  }),
  pageCount: z.number().int().positive().optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  lastDownloadedAt: z.number().int().positive().optional(),
  downloadCount: z.number().int().nonnegative(),
})

export const resumeFileSchema = z.object({
  resumeId: idSchema,
  blob: z.instanceof(Blob),
  sha256: z.string().length(64),
})

export const textIndexEntrySchema = z.object({
  resumeId: idSchema,
  extractedText: z.string(),
})

export const metaEntrySchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
})

export const manifestSchema = z.object({
  app: z.literal('resume-shelf'),
  schemaVersion: z.number().int().positive(),
  exportedAt: z.number().int().positive(),
  spaces: z.array(spaceSchema),
  categories: z.array(categorySchema),
  resumes: z.array(resumeSchema),
  settings: z.record(z.string(), z.unknown()),
})

export type Manifest = z.infer<typeof manifestSchema>
