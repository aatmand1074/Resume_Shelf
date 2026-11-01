import type { Category, Resume, TextIndexEntry } from '@/domain/types'
import type { StorageAdapter } from '@/storage/adapter'

export interface SearchResultItem {
  resume: Resume
  categoryName: string
  matchedField: 'title' | 'headline' | 'summary' | 'skills' | 'tailoredFor' | 'pdfContent'
  snippet: string
}

export interface GroupedSearchResults {
  categoryId: string
  categoryName: string
  items: SearchResultItem[]
}

/**
 * In-memory search index cache for extracted text to keep searches instant
 */
let cachedTextIndex: Map<string, string> | null = null

export async function loadTextIndexCache(storage: StorageAdapter): Promise<Map<string, string>> {
  if (cachedTextIndex) return cachedTextIndex

  const entries: TextIndexEntry[] = await storage.textIndex.listAll()
  const map = new Map<string, string>()
  for (const entry of entries) {
    map.set(entry.resumeId, entry.extractedText)
  }
  cachedTextIndex = map
  return map
}

export function invalidateTextIndexCache(): void {
  cachedTextIndex = null
}

/**
 * Searches across metadata and extracted PDF text, returning results grouped by shelf
 */
export function searchResumes(
  query: string,
  resumes: Resume[],
  categories: Category[],
  textIndexMap?: Map<string, string>
): GroupedSearchResults[] {
  const cleanQuery = query.trim().toLowerCase()
  if (!cleanQuery) return []

  const categoryMap = new Map<string, string>()
  for (const cat of categories) {
    categoryMap.set(cat.id, cat.name)
  }

  const matchedItems: SearchResultItem[] = []

  for (const resume of resumes) {
    const categoryName = categoryMap.get(resume.categoryId) || 'General'

    // 1. Title match
    if (resume.title.toLowerCase().includes(cleanQuery)) {
      matchedItems.push({
        resume,
        categoryName,
        matchedField: 'title',
        snippet: resume.title,
      })
      continue
    }

    // 2. Headline match
    if (resume.headline && resume.headline.toLowerCase().includes(cleanQuery)) {
      matchedItems.push({
        resume,
        categoryName,
        matchedField: 'headline',
        snippet: resume.headline,
      })
      continue
    }

    // 3. Skills match
    const matchedSkill = resume.skills.find((s) => s.toLowerCase().includes(cleanQuery))
    if (matchedSkill) {
      matchedItems.push({
        resume,
        categoryName,
        matchedField: 'skills',
        snippet: `Skill: ${matchedSkill}`,
      })
      continue
    }

    // 4. Tailored for company match
    if (resume.tailoredFor && resume.tailoredFor.toLowerCase().includes(cleanQuery)) {
      matchedItems.push({
        resume,
        categoryName,
        matchedField: 'tailoredFor',
        snippet: `Tailored for: ${resume.tailoredFor}`,
      })
      continue
    }

    // 5. Summary match
    if (resume.summary && resume.summary.toLowerCase().includes(cleanQuery)) {
      const idx = resume.summary.toLowerCase().indexOf(cleanQuery)
      const start = Math.max(0, idx - 25)
      const end = Math.min(resume.summary.length, idx + cleanQuery.length + 35)
      const snippet = `...${resume.summary.substring(start, end)}...`
      matchedItems.push({
        resume,
        categoryName,
        matchedField: 'summary',
        snippet,
      })
      continue
    }

    // 6. Extracted PDF text match (if indexed)
    if (textIndexMap && textIndexMap.has(resume.id)) {
      const fullText = textIndexMap.get(resume.id) || ''
      const lower = fullText.toLowerCase()
      const textIdx = lower.indexOf(cleanQuery)
      if (textIdx !== -1) {
        const start = Math.max(0, textIdx - 30)
        const end = Math.min(fullText.length, textIdx + cleanQuery.length + 45)
        const snippet = `...${fullText.substring(start, end).replace(/\s+/g, ' ')}...`
        matchedItems.push({
          resume,
          categoryName,
          matchedField: 'pdfContent',
          snippet,
        })
        continue
      }
    }
  }

  // Group matched items by shelf
  const groupsMap = new Map<string, GroupedSearchResults>()

  for (const item of matchedItems) {
    const catId = item.resume.categoryId
    if (!groupsMap.has(catId)) {
      groupsMap.set(catId, {
        categoryId: catId,
        categoryName: item.categoryName,
        items: [],
      })
    }
    groupsMap.get(catId)?.items.push(item)
  }

  return Array.from(groupsMap.values())
}
