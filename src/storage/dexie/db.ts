import Dexie, { type Table } from 'dexie'
import type { Space, Category, Resume, ResumeFile, TextIndexEntry, MetaEntry } from '@/domain/types'

export class ResumeShelfDB extends Dexie {
  spaces!: Table<Space, string>
  categories!: Table<Category, string>
  resumes!: Table<Resume, string>
  files!: Table<ResumeFile, string>
  textIndex!: Table<TextIndexEntry, string>
  meta!: Table<MetaEntry, string>

  constructor(databaseName = 'ResumeShelfDB', options?: ConstructorParameters<typeof Dexie>[1]) {
    super(databaseName, options)

    this.version(1).stores({
      spaces: 'id',
      categories: 'id, spaceId, [spaceId+order]',
      resumes: 'id, spaceId, categoryId, updatedAt, *skills',
      files: 'resumeId',
      textIndex: 'resumeId',
      meta: 'key',
    })
  }
}

export const db = new ResumeShelfDB()
