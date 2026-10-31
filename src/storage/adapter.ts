import type {
  ID,
  Space,
  Category,
  Resume,
  ResumeFile,
  TextIndexEntry,
} from '@/domain/types'

export interface ISpaceRepository {
  get(id: ID): Promise<Space | undefined>
  list(): Promise<Space[]>
  save(space: Space): Promise<void>
  delete(id: ID): Promise<void>
}

export interface ICategoryRepository {
  get(id: ID): Promise<Category | undefined>
  listBySpace(spaceId: ID): Promise<Category[]>
  save(category: Category): Promise<void>
  reorder(spaceId: ID, orderedCategoryIds: ID[]): Promise<void>
  delete(id: ID): Promise<void> // Throws if resumes exist in this category
}

export interface IResumeRepository {
  get(id: ID): Promise<Resume | undefined>
  listBySpace(spaceId: ID): Promise<Resume[]>
  listByCategory(categoryId: ID): Promise<Resume[]>
  save(resume: Resume, file?: ResumeFile, textIndex?: TextIndexEntry): Promise<void>
  updateDetails(id: ID, updates: Partial<Resume>): Promise<void>
  recordDownload(id: ID): Promise<void>
  delete(id: ID): Promise<void> // Cascade deletes file and textIndex in one transaction
}

export interface IFileRepository {
  get(resumeId: ID): Promise<ResumeFile | undefined>
  save(file: ResumeFile): Promise<void>
  delete(resumeId: ID): Promise<void>
}

export interface ITextIndexRepository {
  get(resumeId: ID): Promise<TextIndexEntry | undefined>
  save(entry: TextIndexEntry): Promise<void>
  delete(resumeId: ID): Promise<void>
  search(query: string): Promise<ID[]>
}

export interface IMetaRepository {
  get(key: string): Promise<unknown>
  set(key: string, value: unknown): Promise<void>
  delete(key: string): Promise<void>
}

export interface StorageAdapter {
  spaces: ISpaceRepository
  categories: ICategoryRepository
  resumes: IResumeRepository
  files: IFileRepository
  textIndex: ITextIndexRepository
  meta: IMetaRepository
  transaction<T>(mode: 'r' | 'rw', tables: string[], fn: () => Promise<T>): Promise<T>
  clearAll(): Promise<void>
}
