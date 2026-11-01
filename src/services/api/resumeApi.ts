import type { StorageAdapter } from '@/storage/adapter'
import type { Resume, ResumeFile, TextIndexEntry, ID } from '@/domain/types'
import { resumeSchema } from '@/domain/schemas'
import {
  createSuccessResponse,
  createErrorResponse,
  type ApiResponse,
  NotFoundError,
  ValidationError,
} from './types'

export class ResumeApiService {
  constructor(private storage: StorageAdapter) {}

  async listBySpace(spaceId: ID): Promise<ApiResponse<Resume[]>> {
    try {
      const resumes = await this.storage.resumes.listBySpace(spaceId)
      return createSuccessResponse(resumes)
    } catch (err) {
      return createErrorResponse(
        err instanceof Error ? err.message : 'Failed to retrieve resumes',
        'FETCH_RESUMES_FAILED'
      )
    }
  }

  async getById(id: ID): Promise<ApiResponse<Resume>> {
    try {
      const resume = await this.storage.resumes.get(id)
      if (!resume) {
        throw new NotFoundError('Resume', id)
      }
      return createSuccessResponse(resume)
    } catch (err) {
      if (err instanceof NotFoundError) {
        return createErrorResponse(err.message, err.code)
      }
      return createErrorResponse(
        err instanceof Error ? err.message : 'Failed to fetch resume',
        'FETCH_RESUME_FAILED'
      )
    }
  }

  async saveResume(
    resume: Resume,
    file?: ResumeFile,
    textIndex?: TextIndexEntry
  ): Promise<ApiResponse<Resume>> {
    try {
      const validation = resumeSchema.safeParse(resume)
      if (!validation.success) {
        throw new ValidationError('Resume validation failed', validation.error.issues)
      }

      await this.storage.resumes.save(resume, file, textIndex)
      return createSuccessResponse(resume)
    } catch (err) {
      if (err instanceof ValidationError) {
        return createErrorResponse(err.message, err.code, err.details)
      }
      return createErrorResponse(
        err instanceof Error ? err.message : 'Failed to save resume',
        'SAVE_RESUME_FAILED'
      )
    }
  }

  async deleteResume(id: ID): Promise<ApiResponse<{ id: ID; deleted: boolean }>> {
    try {
      const existing = await this.storage.resumes.get(id)
      if (!existing) {
        throw new NotFoundError('Resume', id)
      }
      await this.storage.resumes.delete(id)
      return createSuccessResponse({ id, deleted: true })
    } catch (err) {
      if (err instanceof NotFoundError) {
        return createErrorResponse(err.message, err.code)
      }
      return createErrorResponse(
        err instanceof Error ? err.message : 'Failed to delete resume',
        'DELETE_RESUME_FAILED'
      )
    }
  }

  async recordDownload(id: ID): Promise<ApiResponse<Resume>> {
    try {
      const resume = await this.storage.resumes.get(id)
      if (!resume) {
        throw new NotFoundError('Resume', id)
      }

      const updated: Resume = {
        ...resume,
        lastDownloadedAt: Date.now(),
        downloadCount: (resume.downloadCount || 0) + 1,
        updatedAt: Date.now(),
      }

      await this.storage.resumes.save(updated)
      return createSuccessResponse(updated)
    } catch (err) {
      return createErrorResponse(
        err instanceof Error ? err.message : 'Failed to record download',
        'RECORD_DOWNLOAD_FAILED'
      )
    }
  }
}
