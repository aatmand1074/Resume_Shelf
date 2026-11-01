import type { ResumeShelfDB } from './db'
import type {
  ID,
  Space,
  Category,
  Resume,
  ResumeFile,
  TextIndexEntry,
} from '@/domain/types'
import type {
  StorageAdapter,
  ISpaceRepository,
  ICategoryRepository,
  IResumeRepository,
  IFileRepository,
  ITextIndexRepository,
  IMetaRepository,
} from '../adapter'

export class DexieSpaceRepository implements ISpaceRepository {
  constructor(private db: ResumeShelfDB) {}

  async get(id: ID): Promise<Space | undefined> {
    return this.db.spaces.get(id)
  }

  async list(): Promise<Space[]> {
    return this.db.spaces.toArray()
  }

  async save(space: Space): Promise<void> {
    await this.db.spaces.put(space)
  }

  async delete(id: ID): Promise<void> {
    await this.db.spaces.delete(id)
  }
}

export class DexieCategoryRepository implements ICategoryRepository {
  constructor(private db: ResumeShelfDB) {}

  async get(id: ID): Promise<Category | undefined> {
    return this.db.categories.get(id)
  }

  async listBySpace(spaceId: ID): Promise<Category[]> {
    return this.db.categories.where('spaceId').equals(spaceId).sortBy('order')
  }

  async save(category: Category): Promise<void> {
    await this.db.categories.put(category)
  }

  async reorder(spaceId: ID, orderedCategoryIds: ID[]): Promise<void> {
    await this.db.transaction('rw', this.db.categories, async () => {
      for (let i = 0; i < orderedCategoryIds.length; i++) {
        const id = orderedCategoryIds[i]
        const cat = await this.db.categories.get(id)
        if (cat && cat.spaceId === spaceId) {
          await this.db.categories.update(id, { order: i })
        }
      }
    })
  }

  async delete(id: ID): Promise<void> {
    const resumesCount = await this.db.resumes.where('categoryId').equals(id).count()
    if (resumesCount > 0) {
      throw new Error(
        `Cannot delete category with ${resumesCount.toString()} resume(s). Move or delete them first.`
      )
    }
    await this.db.categories.delete(id)
  }
}

export class DexieResumeRepository implements IResumeRepository {
  constructor(private db: ResumeShelfDB) {}

  async get(id: ID): Promise<Resume | undefined> {
    return this.db.resumes.get(id)
  }

  async listBySpace(spaceId: ID): Promise<Resume[]> {
    return this.db.resumes.where('spaceId').equals(spaceId).sortBy('updatedAt')
  }

  async listByCategory(categoryId: ID): Promise<Resume[]> {
    return this.db.resumes.where('categoryId').equals(categoryId).toArray()
  }

  async save(resume: Resume, file?: ResumeFile, textIndex?: TextIndexEntry): Promise<void> {
    await this.db.transaction('rw', [this.db.resumes, this.db.files, this.db.textIndex], async () => {
      await this.db.resumes.put(resume)
      if (file) {
        await this.db.files.put(file)
      }
      if (textIndex) {
        await this.db.textIndex.put(textIndex)
      }
    })
  }

  async updateDetails(id: ID, updates: Partial<Resume>): Promise<void> {
    await this.db.resumes.update(id, {
      ...updates,
      updatedAt: Date.now(),
    })
  }

  async recordDownload(id: ID): Promise<void> {
    const resume = await this.db.resumes.get(id)
    if (resume) {
      await this.db.resumes.update(id, {
        lastDownloadedAt: Date.now(),
        downloadCount: resume.downloadCount + 1,
      })
    }
  }

  async delete(id: ID): Promise<void> {
    await this.db.transaction('rw', [this.db.resumes, this.db.files, this.db.textIndex], async () => {
      await this.db.resumes.delete(id)
      await this.db.files.delete(id)
      await this.db.textIndex.delete(id)
    })
  }
}

export class DexieFileRepository implements IFileRepository {
  constructor(private db: ResumeShelfDB) {}

  async get(resumeId: ID): Promise<ResumeFile | undefined> {
    return this.db.files.get(resumeId)
  }

  async save(file: ResumeFile): Promise<void> {
    await this.db.files.put(file)
  }

  async delete(resumeId: ID): Promise<void> {
    await this.db.files.delete(resumeId)
  }
}

export class DexieTextIndexRepository implements ITextIndexRepository {
  constructor(private db: ResumeShelfDB) {}

  async get(resumeId: ID): Promise<TextIndexEntry | undefined> {
    return this.db.textIndex.get(resumeId)
  }

  async listAll(): Promise<TextIndexEntry[]> {
    return this.db.textIndex.toArray()
  }

  async save(entry: TextIndexEntry): Promise<void> {
    await this.db.textIndex.put(entry)
  }

  async delete(resumeId: ID): Promise<void> {
    await this.db.textIndex.delete(resumeId)
  }

  async search(query: string): Promise<ID[]> {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const matching = await this.db.textIndex
      .filter((entry) => entry.extractedText.toLowerCase().includes(q))
      .toArray()
    return matching.map((m) => m.resumeId)
  }
}

export class DexieMetaRepository implements IMetaRepository {
  constructor(private db: ResumeShelfDB) {}

  async get(key: string): Promise<unknown> {
    const entry = await this.db.meta.get(key)
    return entry?.value
  }

  async set(key: string, value: unknown): Promise<void> {
    await this.db.meta.put({ key, value })
  }

  async delete(key: string): Promise<void> {
    await this.db.meta.delete(key)
  }
}

export class DexieStorageAdapter implements StorageAdapter {
  spaces: ISpaceRepository
  categories: ICategoryRepository
  resumes: IResumeRepository
  files: IFileRepository
  textIndex: ITextIndexRepository
  meta: IMetaRepository

  constructor(private db: ResumeShelfDB) {
    this.spaces = new DexieSpaceRepository(db)
    this.categories = new DexieCategoryRepository(db)
    this.resumes = new DexieResumeRepository(db)
    this.files = new DexieFileRepository(db)
    this.textIndex = new DexieTextIndexRepository(db)
    this.meta = new DexieMetaRepository(db)
  }

  async transaction<T>(_mode: 'r' | 'rw', _tables: string[], fn: () => Promise<T>): Promise<T> {
    return this.db.transaction(_mode, this.db.tables, fn)
  }

  async clearAll(): Promise<void> {
    await this.db.transaction('rw', this.db.tables, async () => {
      await Promise.all(this.db.tables.map((table) => table.clear()))
    })
  }
}
