import { storageAdapter } from '@/storage/hooks'
import { ResumeApiService } from './resumeApi'
import { CategoryApiService } from './categoryApi'

export * from './types'
export * from './resumeApi'
export * from './categoryApi'

export const resumeApi = new ResumeApiService(storageAdapter)
export const categoryApi = new CategoryApiService(storageAdapter)
