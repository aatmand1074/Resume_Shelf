import type { Space, Category } from '@/domain/types'
import { SPINE_PALETTE } from '@/domain/types'
import type { StorageAdapter } from './adapter'

export const DEFAULT_SPACE_ID = '00000000-0000-0000-0000-000000000001'

export const STARTER_CATEGORIES = [
  { name: 'Data Analyst', color: SPINE_PALETTE[0], order: 0 },
  { name: 'AI/ML Engineer', color: SPINE_PALETTE[1], order: 1 },
  { name: 'Full-Stack Developer', color: SPINE_PALETTE[2], order: 2 },
  { name: 'Python/Backend Developer', color: SPINE_PALETTE[3], order: 3 },
]

export async function seedInitialDataIfNeeded(storage: StorageAdapter): Promise<void> {
  const spaces = await storage.spaces.list()
  if (spaces.length > 0) return

  const now = Date.now()
  const defaultSpace: Space = {
    id: DEFAULT_SPACE_ID,
    name: 'My Library',
    tagline: 'Personal Resume Shelves',
    createdAt: now,
  }

  await storage.spaces.save(defaultSpace)

  for (const starter of STARTER_CATEGORIES) {
    const category: Category = {
      id: crypto.randomUUID(),
      spaceId: DEFAULT_SPACE_ID,
      name: starter.name,
      color: starter.color,
      order: starter.order,
      createdAt: now,
    }
    await storage.categories.save(category)
  }
}
