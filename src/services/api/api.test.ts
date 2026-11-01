import { describe, it, expect, beforeEach } from 'vitest'
import { indexedDB as fakeIndexedDB, IDBKeyRange as fakeIDBKeyRange } from 'fake-indexeddb'
import { ResumeShelfDB } from '@/storage/dexie/db'
import { DexieStorageAdapter } from '@/storage/dexie/repositories'
import { ResumeApiService } from './resumeApi'
import { CategoryApiService } from './categoryApi'
import { DEFAULT_SPACE_ID } from '@/storage/seed'
import type { Category, Resume } from '@/domain/types'

describe('API Service Layer Tests', () => {
  let db: ResumeShelfDB
  let storage: DexieStorageAdapter
  let resumeApi: ResumeApiService
  let categoryApi: CategoryApiService

  beforeEach(async () => {
    db = new ResumeShelfDB(`test-api-db-${crypto.randomUUID()}`, {
      indexedDB: fakeIndexedDB,
      IDBKeyRange: fakeIDBKeyRange,
    })
    storage = new DexieStorageAdapter(db)
    resumeApi = new ResumeApiService(storage)
    categoryApi = new CategoryApiService(storage)

    await storage.spaces.save({
      id: DEFAULT_SPACE_ID,
      name: 'Default Space',
      createdAt: Date.now(),
    })
  })

  it('saves and lists categories with validation', async () => {
    const validCategory: Category = {
      id: crypto.randomUUID(),
      spaceId: DEFAULT_SPACE_ID,
      name: 'Frontend Engineer',
      color: '#7A9E7E',
      order: 0,
      createdAt: Date.now(),
    }

    const saveRes = await categoryApi.saveCategory(validCategory)
    expect(saveRes.success).toBe(true)
    expect(saveRes.data?.name).toBe('Frontend Engineer')

    const listRes = await categoryApi.listBySpace(DEFAULT_SPACE_ID)
    expect(listRes.success).toBe(true)
    expect(listRes.data?.length).toBe(1)
  })

  it('rejects invalid category data with validation error response', async () => {
    const invalidCategory = {
      id: crypto.randomUUID(),
      spaceId: DEFAULT_SPACE_ID,
      name: '', // Empty name triggers Zod validation failure
      color: 'red',
      order: 0,
      createdAt: Date.now(),
    } as unknown as Category

    const saveRes = await categoryApi.saveCategory(invalidCategory)
    expect(saveRes.success).toBe(false)
    expect(saveRes.error?.code).toBe('VALIDATION_ERROR')
  })

  it('saves resume, records download count and deletes safely', async () => {
    const resumeId = crypto.randomUUID()
    const catId = crypto.randomUUID()

    await categoryApi.saveCategory({
      id: catId,
      spaceId: DEFAULT_SPACE_ID,
      name: 'DevOps',
      color: '#5B7FA6',
      order: 0,
      createdAt: Date.now(),
    })

    const resume: Resume = {
      id: resumeId,
      spaceId: DEFAULT_SPACE_ID,
      categoryId: catId,
      title: 'Site Reliability Engineer',
      headline: 'Kubernetes & Terraform Specialist',
      summary: 'Experienced cloud engineer managing multi-region clusters.',
      skills: ['Kubernetes', 'Terraform', 'AWS'],
      spineColor: '#5B7FA6',
      pinned: false,
      fileName: 'sre-resume.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 0,
    }

    const saveRes = await resumeApi.saveResume(resume)
    expect(saveRes.success).toBe(true)

    const dlRes = await resumeApi.recordDownload(resumeId)
    expect(dlRes.success).toBe(true)
    expect(dlRes.data?.downloadCount).toBe(1)

    const delRes = await resumeApi.deleteResume(resumeId)
    expect(delRes.success).toBe(true)
    expect(delRes.data?.deleted).toBe(true)
  })
})
