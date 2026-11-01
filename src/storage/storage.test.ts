import { describe, it, expect, beforeEach } from 'vitest'
import { indexedDB as fakeIndexedDB, IDBKeyRange as fakeIDBKeyRange } from 'fake-indexeddb'
import { ResumeShelfDB } from '@/storage/dexie/db'
import { DexieStorageAdapter } from '@/storage/dexie/repositories'
import { seedInitialDataIfNeeded, DEFAULT_SPACE_ID } from '@/storage/seed'
import { exportBackup, importBackup } from '@/services/backup'
import { generateDownloadFilename } from '@/domain/filename'
import { suggestSkillsFromText } from '@/domain/skills'
import type { Resume, ResumeFile } from '@/domain/types'

describe('Data Layer & Storage Integration Tests', () => {
  let testDb: ResumeShelfDB
  let storage: DexieStorageAdapter

  beforeEach(async () => {
    // Generate a fresh unique DB per test using fake-indexeddb
    testDb = new ResumeShelfDB(`test-db-${crypto.randomUUID()}`, {
      indexedDB: fakeIndexedDB,
      IDBKeyRange: fakeIDBKeyRange,
    })
    storage = new DexieStorageAdapter(testDb)
    await seedInitialDataIfNeeded(storage)
  })

  it('seeds default space and starter categories', async () => {
    const spaces = await storage.spaces.list()
    expect(spaces.length).toBe(1)
    expect(spaces[0].id).toBe(DEFAULT_SPACE_ID)

    const categories = await storage.categories.listBySpace(DEFAULT_SPACE_ID)
    expect(categories.length).toBe(4)
    expect(categories[0].name).toBe('Data Analyst')
  })

  it('creates, reads, and updates a resume with binary file', async () => {
    const categories = await storage.categories.listBySpace(DEFAULT_SPACE_ID)
    const targetCategory = categories[0]

    const resumeId = crypto.randomUUID()
    const dummyBlob = new Blob(['%PDF-1.4 dummy resume content'], { type: 'application/pdf' })

    const resume: Resume = {
      id: resumeId,
      spaceId: DEFAULT_SPACE_ID,
      categoryId: targetCategory.id,
      title: 'Senior Data Analyst',
      version: 'v2.1',
      headline: 'Data Analyst with 5+ yrs experience',
      summary: 'Proven experience building ETL pipelines and dashboards.',
      skills: ['Python', 'SQL', 'Tableau'],
      tailoredFor: 'Fintech Corp',
      spineColor: 'var(--spine-0)',
      pinned: true,
      fileName: 'JohnDoe_DataAnalyst.pdf',
      mimeType: 'application/pdf',
      sizeBytes: dummyBlob.size,
      pageCount: 2,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 0,
    }

    const file: ResumeFile = {
      resumeId,
      blob: dummyBlob,
      sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
    }

    // Save resume and file atomically
    await storage.resumes.save(resume, file)

    // Retrieve and verify
    const saved = await storage.resumes.get(resumeId)
    expect(saved).toBeDefined()
    expect(saved?.title).toBe('Senior Data Analyst')
    expect(saved?.skills).toEqual(['Python', 'SQL', 'Tableau'])

    const savedFile = await storage.files.get(resumeId)
    expect(savedFile).toBeDefined()
    expect(savedFile?.sha256).toBe(file.sha256)

    // Test recordDownload
    await storage.resumes.recordDownload(resumeId)
    const afterDownload = await storage.resumes.get(resumeId)
    expect(afterDownload?.downloadCount).toBe(1)
    expect(afterDownload?.lastDownloadedAt).toBeDefined()
  })

  it('cascades deletion of resume file and text index', async () => {
    const categories = await storage.categories.listBySpace(DEFAULT_SPACE_ID)
    const resumeId = crypto.randomUUID()

    const resume: Resume = {
      id: resumeId,
      spaceId: DEFAULT_SPACE_ID,
      categoryId: categories[0].id,
      title: 'To Be Deleted',
      headline: 'Temporary',
      summary: 'Temporary',
      skills: ['Python'],
      spineColor: 'var(--spine-1)',
      pinned: false,
      fileName: 'temp.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 100,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 0,
    }

    const file: ResumeFile = {
      resumeId,
      blob: new Blob(['content']),
      sha256: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    }

    await storage.resumes.save(resume, file, { resumeId, extractedText: 'Python fullstack' })
    await storage.resumes.delete(resumeId)

    expect(await storage.resumes.get(resumeId)).toBeUndefined()
    expect(await storage.files.get(resumeId)).toBeUndefined()
    expect(await storage.textIndex.get(resumeId)).toBeUndefined()
  })

  it('blocks category deletion if resumes exist inside it', async () => {
    const categories = await storage.categories.listBySpace(DEFAULT_SPACE_ID)
    const cat = categories[0]

    const resume: Resume = {
      id: crypto.randomUUID(),
      spaceId: DEFAULT_SPACE_ID,
      categoryId: cat.id,
      title: 'Protected Resume',
      headline: 'Lead',
      summary: 'Summary',
      skills: ['React'],
      spineColor: 'var(--spine-2)',
      pinned: false,
      fileName: 'lead.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 150,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 0,
    }

    await storage.resumes.save(resume)

    // Attempt deleting category must reject
    await expect(storage.categories.delete(cat.id)).rejects.toThrow(/Cannot delete category/)
  })

  it('reorders categories correctly', async () => {
    const categories = await storage.categories.listBySpace(DEFAULT_SPACE_ID)
    const reversedIds = categories.map((c) => c.id).reverse()

    await storage.categories.reorder(DEFAULT_SPACE_ID, reversedIds)

    const reordered = await storage.categories.listBySpace(DEFAULT_SPACE_ID)
    expect(reordered.map((c) => c.id)).toEqual(reversedIds)
  })

  it('exports full backup zip and restores it cleanly', async () => {
    const categories = await storage.categories.listBySpace(DEFAULT_SPACE_ID)
    const resumeId = crypto.randomUUID()
    const testContent = 'Special content for backup test'
    const blob = new Blob([testContent], { type: 'application/pdf' })

    const resume: Resume = {
      id: resumeId,
      spaceId: DEFAULT_SPACE_ID,
      categoryId: categories[1].id,
      title: 'AI Researcher',
      version: 'v1.0',
      headline: 'Deep learning researcher',
      summary: 'Specialized in transformer models',
      skills: ['PyTorch', 'Python', 'NLP'],
      spineColor: 'var(--spine-3)',
      pinned: true,
      fileName: 'AI_Researcher.pdf',
      mimeType: 'application/pdf',
      sizeBytes: blob.size,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 5,
    }

    const hashBuffer = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
    const sha256 = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    await storage.resumes.save(resume, { resumeId, blob, sha256 })

    // Export backup
    const { blob: backupBlob, manifest } = await exportBackup(storage, DEFAULT_SPACE_ID)
    expect(backupBlob.size).toBeGreaterThan(0)
    expect(manifest.resumes.length).toBe(1)
    expect(manifest.resumes[0].title).toBe('AI Researcher')

    // Verify stored file before export
    const originalFile = await storage.files.get(resumeId)
    expect(originalFile).toBeDefined()
    expect(originalFile?.sha256).toBe(sha256)

    // Create a brand new database and import
    const newDb = new ResumeShelfDB(`import-test-db-${crypto.randomUUID()}`, {
      indexedDB: fakeIndexedDB,
      IDBKeyRange: fakeIDBKeyRange,
    })
    const newStorage = new DexieStorageAdapter(newDb)

    const importResult = await importBackup(backupBlob, newStorage, { mode: 'replace' })
    expect(importResult.importedCount).toBe(1)

    // Verify restored data
    const restoredResume = await newStorage.resumes.get(resumeId)
    expect(restoredResume).toBeDefined()
    expect(restoredResume?.title).toBe('AI Researcher')
    expect(restoredResume?.skills).toContain('PyTorch')

    const restoredFile = await newStorage.files.get(resumeId)
    expect(restoredFile).toBeDefined()
    expect(restoredFile?.sha256).toBe(sha256)
  })

  it('generates sanitized download filenames from template', () => {
    const filename = generateDownloadFilename(
      '{name}_{shelf}_{version}',
      { name: 'John Doe', shelf: 'Data Analyst', version: 'v1.2' },
      'my-resume.pdf'
    )
    expect(filename).toBe('John_Doe_Data_Analyst_v1.2.pdf')
  })

  it('suggests skills accurately from extracted text based on dictionary', () => {
    const sampleText = `
      Experienced Software Engineer with strong background in TypeScript, React, and Next.js.
      Deep expertise in building microservices with Python, FastAPI, and PostgreSQL.
      Proficient in Docker, Kubernetes, and AWS cloud deployments.
    `
    const suggestions = suggestSkillsFromText(sampleText, 5)
    expect(suggestions).toContain('TypeScript')
    expect(suggestions).toContain('Python')
    expect(suggestions).toContain('React')
  })
})
