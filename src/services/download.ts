import { generateDownloadFilename } from '@/domain/filename'
import type { Resume } from '@/domain/types'
import type { StorageAdapter } from '@/storage/adapter'

/**
 * Triggers client-side download of a resume binary file with sanitized template filename
 */
export async function downloadResumeFile(
  resume: Resume,
  categoryName: string,
  storage: StorageAdapter,
  template?: string
): Promise<void> {
  const fileEntry = await storage.files.get(resume.id)
  if (!fileEntry) {
    throw new Error(`File binary not found for resume "${resume.title}".`)
  }

  const filename = generateDownloadFilename(
    template || '{name}_{shelf}_{version}',
    {
      name: resume.tailoredFor || resume.title,
      shelf: categoryName,
      version: resume.version || 'v1',
      title: resume.title,
      date: new Date().toISOString().split('T')[0],
    },
    resume.fileName
  )

  // Create temporary blob URL and trigger anchor download
  const blobUrl = URL.createObjectURL(fileEntry.blob)
  try {
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } finally {
    // Revoke object URL after slight delay to ensure browser initiated download
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 1500)
  }

  // Update download stats
  await storage.resumes.save({
    ...resume,
    lastDownloadedAt: Date.now(),
    downloadCount: (resume.downloadCount || 0) + 1,
    updatedAt: Date.now(),
  })
}
