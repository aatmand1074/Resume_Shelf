import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './dexie/db'
import { DexieStorageAdapter } from './dexie/repositories'
import type { ID, Space, Category, Resume } from '@/domain/types'

export const storageAdapter = new DexieStorageAdapter(db)

export function useSpaces(): Space[] | undefined {
  return useLiveQuery(() => db.spaces.toArray(), [])
}

export function useCategories(spaceId: ID): Category[] | undefined {
  return useLiveQuery(
    () => db.categories.where('spaceId').equals(spaceId).sortBy('order'),
    [spaceId]
  )
}

export function useResumes(spaceId: ID): Resume[] | undefined {
  return useLiveQuery(
    () => db.resumes.where('spaceId').equals(spaceId).reverse().sortBy('updatedAt'),
    [spaceId]
  )
}

export function useCategoryResumes(categoryId: ID): Resume[] | undefined {
  return useLiveQuery(
    () => db.resumes.where('categoryId').equals(categoryId).toArray(),
    [categoryId]
  )
}

export function useResume(resumeId: ID): Resume | undefined {
  return useLiveQuery(() => db.resumes.get(resumeId), [resumeId])
}

export function useMeta(key: string): unknown {
  const result = useLiveQuery(async () => {
    const entry = await db.meta.get(key)
    return entry?.value
  }, [key])
  return result
}
