import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate'
import { manifestSchema, type Manifest } from '@/domain/schemas'
import type { StorageAdapter } from '@/storage/adapter'
import type { ResumeFile } from '@/domain/types'

export interface BackupExportResult {
  blob: Blob
  filename: string
  manifest: Manifest
}

export async function exportBackup(
  storage: StorageAdapter,
  spaceId: string
): Promise<BackupExportResult> {
  const [spaces, categories, resumes] = await Promise.all([
    storage.spaces.list(),
    storage.categories.listBySpace(spaceId),
    storage.resumes.listBySpace(spaceId),
  ])

  const manifest: Manifest = {
    app: 'resume-shelf',
    schemaVersion: 1,
    exportedAt: Date.now(),
    spaces,
    categories,
    resumes,
    settings: {},
  }

  // Validate manifest before exporting
  manifestSchema.parse(manifest)

  const zipData: Record<string, Uint8Array> = {}
  zipData['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2))

  for (const resume of resumes) {
    const file = await storage.files.get(resume.id)
    if (file) {
      const arrayBuffer = await file.blob.arrayBuffer()
      const ext = (resume.fileName.includes('.') ? resume.fileName.split('.').pop() : 'pdf') ?? 'pdf'
      zipData[`files/${resume.id}.${ext}`] = new Uint8Array(arrayBuffer)
    }
  }

  const zipped = zipSync(zipData)

  const dateStr = new Date().toISOString().split('T')[0]
  const filename = `resume-shelf-backup-${dateStr}.zip`

  return {
    blob: new Blob([zipped], { type: 'application/zip' }),
    filename,
    manifest,
  }
}

export interface BackupImportOptions {
  mode: 'replace' | 'merge' // replace all or merge by ID (newer updatedAt wins)
}

export async function importBackup(
  zipBlob: Blob,
  storage: StorageAdapter,
  options: BackupImportOptions = { mode: 'replace' }
): Promise<{ importedCount: number; categoriesCount: number }> {
  const arrayBuffer = await zipBlob.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const unzipped = unzipSync(buffer)

  const manifestFile = unzipped['manifest.json']
  if (!(manifestFile instanceof Uint8Array)) {
    throw new Error('Invalid backup archive: manifest.json not found.')
  }

  const manifestJson: unknown = JSON.parse(strFromU8(manifestFile))
  const manifest = manifestSchema.parse(manifestJson)

  if (options.mode === 'replace') {
    await storage.clearAll()
  }

  // Import spaces
  for (const space of manifest.spaces) {
    await storage.spaces.save(space)
  }

  // Import categories
  for (const category of manifest.categories) {
    await storage.categories.save(category)
  }

  let importedCount = 0

  // Import resumes and files
  for (const resume of manifest.resumes) {
    if (options.mode === 'merge') {
      const existing = await storage.resumes.get(resume.id)
      if (existing && existing.updatedAt >= resume.updatedAt) {
        // Skip older record in merge mode
        continue
      }
    }

    // Find the file in the zip
    const fileEntryKey = Object.keys(unzipped).find(
      (key) => key.startsWith(`files/${resume.id}.`)
    )

    let resumeFile: ResumeFile | undefined
    if (fileEntryKey) {
      const fileBytes = unzipped[fileEntryKey]
      const blob = new Blob([fileBytes], { type: resume.mimeType })

      // Calculate sha256
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBytes)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const sha256 = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

      resumeFile = {
        resumeId: resume.id,
        blob,
        sha256,
      }
    }

    await storage.resumes.save(resume, resumeFile)
    importedCount++
  }

  // Update lastBackupAt timestamp
  await storage.meta.set('lastBackupAt', Date.now())

  return {
    importedCount,
    categoriesCount: manifest.categories.length,
  }
}
