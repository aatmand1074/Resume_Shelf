import React from 'react'
import type { Category, ID } from '@/domain/types'
import { storageAdapter } from '@/storage/hooks'

export interface UseCategoryActionsReturn {
  loading: boolean
  error: string | null
  saveCategory: (spaceId: ID, name: string, color: string, existing?: Category) => Promise<Category>
  deleteCategory: (id: ID) => Promise<void>
  reorderCategories: (spaceId: ID, orderedIds: ID[]) => Promise<void>
}

/**
 * Custom hook encapsulating category business logic and state management
 */
export function useCategoryActions(categoriesCount = 0): UseCategoryActionsReturn {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const saveCategory = React.useCallback(
    async (spaceId: ID, name: string, color: string, existing?: Category): Promise<Category> => {
      setLoading(true)
      setError(null)
      try {
        if (existing) {
          const updated: Category = {
            ...existing,
            name: name.trim(),
            color,
          }
          await storageAdapter.categories.save(updated)
          return updated
        } else {
          const created: Category = {
            id: crypto.randomUUID(),
            spaceId,
            name: name.trim(),
            color,
            order: categoriesCount,
            createdAt: Date.now(),
          }
          await storageAdapter.categories.save(created)
          return created
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save shelf'
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [categoriesCount]
  )

  const deleteCategory = React.useCallback(async (id: ID): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await storageAdapter.categories.delete(id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Cannot delete shelf'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reorderCategories = React.useCallback(async (spaceId: ID, orderedIds: ID[]): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await storageAdapter.categories.reorder(spaceId, orderedIds)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reorder shelves'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    saveCategory,
    deleteCategory,
    reorderCategories,
  }
}
