/**
 * Browser persistence & quota inspection service
 */

export interface StoragePersistenceStatus {
  isPersisted: boolean
  isSupported: boolean
  quotaBytes?: number
  usageBytes?: number
  percentUsed?: number
}

/**
 * Requests persistent storage from the browser to prevent eviction
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator.storage.persist === 'function') {
    try {
      return await navigator.storage.persist()
    } catch (err) {
      console.warn('Could not request storage persistence:', err)
      return false
    }
  }
  return false
}

/**
 * Checks current storage status, persistence, and quota usage
 */
export async function getStorageStatus(): Promise<StoragePersistenceStatus> {
  const isSupported = typeof navigator.storage.persist === 'function'
  let isPersisted = false
  let quotaBytes: number | undefined
  let usageBytes: number | undefined
  let percentUsed: number | undefined

  if (typeof navigator.storage.persisted === 'function') {
    try {
      isPersisted = await navigator.storage.persisted()
    } catch {
      isPersisted = false
    }
  }

  if (typeof navigator.storage.estimate === 'function') {
    try {
      const estimate = await navigator.storage.estimate()
      quotaBytes = estimate.quota
      usageBytes = estimate.usage
      if (quotaBytes && usageBytes) {
        percentUsed = Math.round((usageBytes / quotaBytes) * 100)
      }
    } catch (err) {
      console.warn('Could not retrieve storage estimate:', err)
    }
  }

  return {
    isPersisted,
    isSupported,
    quotaBytes,
    usageBytes,
    percentUsed,
  }
}
