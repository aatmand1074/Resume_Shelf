import type { StorageAdapter } from '@/storage/adapter'
import type { Category, ID } from '@/domain/types'
import { categorySchema } from '@/domain/schemas'
import {
  createSuccessResponse,
  createErrorResponse,
  type ApiResponse,
  NotFoundError,
  ValidationError,
} from './types'

export class CategoryApiService {
  constructor(private storage: StorageAdapter) {}

  async listBySpace(spaceId: ID): Promise<ApiResponse<Category[]>> {
    try {
      const categories = await this.storage.categories.listBySpace(spaceId)
      return createSuccessResponse(categories)
    } catch (err) {
      return createErrorResponse(
        err instanceof Error ? err.message : 'Failed to fetch categories',
        'FETCH_CATEGORIES_FAILED'
      )
    }
  }

  async saveCategory(category: Category): Promise<ApiResponse<Category>> {
    try {
      const validation = categorySchema.safeParse(category)
      if (!validation.success) {
        throw new ValidationError('Invalid category data', validation.error.issues)
      }

      await this.storage.categories.save(category)
      return createSuccessResponse(category)
    } catch (err) {
      if (err instanceof ValidationError) {
        return createErrorResponse(err.message, err.code, err.details)
      }
      return createErrorResponse(
        err instanceof Error ? err.message : 'Failed to save category',
        'SAVE_CATEGORY_FAILED'
      )
    }
  }

  async reorderCategories(spaceId: ID, orderedIds: ID[]): Promise<ApiResponse<{ reordered: boolean }>> {
    try {
      await this.storage.categories.reorder(spaceId, orderedIds)
      return createSuccessResponse({ reordered: true })
    } catch (err) {
      return createErrorResponse(
        err instanceof Error ? err.message : 'Failed to reorder categories',
        'REORDER_CATEGORIES_FAILED'
      )
    }
  }

  async deleteCategory(id: ID): Promise<ApiResponse<{ id: ID; deleted: boolean }>> {
    try {
      const existing = await this.storage.categories.get(id)
      if (!existing) {
        throw new NotFoundError('Category', id)
      }
      await this.storage.categories.delete(id)
      return createSuccessResponse({ id, deleted: true })
    } catch (err) {
      if (err instanceof NotFoundError) {
        return createErrorResponse(err.message, err.code)
      }
      return createErrorResponse(
        err instanceof Error ? err.message : 'Failed to delete category',
        'DELETE_CATEGORY_FAILED'
      )
    }
  }
}
