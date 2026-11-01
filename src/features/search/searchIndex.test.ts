import { describe, it, expect } from 'vitest'
import { searchResumes } from './searchIndex'
import type { Category, Resume } from '@/domain/types'

describe('Search Index & Command Palette Logic', () => {
  const dummyCategories: Category[] = [
    {
      id: 'cat-1',
      spaceId: 'default-space',
      name: 'Data Science',
      color: '#7A9E7E',
      order: 0,
      createdAt: 1000,
    },
    {
      id: 'cat-2',
      spaceId: 'default-space',
      name: 'Frontend',
      color: '#5B7FA6',
      order: 1,
      createdAt: 1000,
    },
  ]

  const dummyResumes: Resume[] = [
    {
      id: 'res-1',
      spaceId: 'default-space',
      categoryId: 'cat-1',
      title: 'Principal Data Scientist',
      headline: 'Deep Learning & Natural Language Processing specialist',
      summary: 'Authored PyTorch models deployed to Kubernetes.',
      skills: ['Python', 'PyTorch', 'Docker'],
      tailoredFor: 'OpenAI',
      spineColor: '#7A9E7E',
      pinned: true,
      fileName: 'DataScientist.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2048,
      createdAt: 1000,
      updatedAt: 1000,
      downloadCount: 0,
    },
    {
      id: 'res-2',
      spaceId: 'default-space',
      categoryId: 'cat-2',
      title: 'Senior Frontend Architect',
      headline: 'React 19 & Tailwind CSS Guru',
      summary: 'Built accessible design systems with Radix UI.',
      skills: ['TypeScript', 'React', 'CSS'],
      tailoredFor: 'Vercel',
      spineColor: '#5B7FA6',
      pinned: false,
      fileName: 'FrontendArchitect.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
      createdAt: 1000,
      updatedAt: 1000,
      downloadCount: 0,
    },
  ]

  it('finds resume by title match', () => {
    const results = searchResumes('Principal', dummyResumes, dummyCategories)
    expect(results.length).toBe(1)
    expect(results[0].items[0].resume.id).toBe('res-1')
    expect(results[0].items[0].matchedField).toBe('title')
  })

  it('finds resume by skill tag', () => {
    const results = searchResumes('TypeScript', dummyResumes, dummyCategories)
    expect(results.length).toBe(1)
    expect(results[0].items[0].resume.id).toBe('res-2')
    expect(results[0].items[0].matchedField).toBe('skills')
  })

  it('finds resume by tailored company', () => {
    const results = searchResumes('OpenAI', dummyResumes, dummyCategories)
    expect(results.length).toBe(1)
    expect(results[0].items[0].resume.id).toBe('res-1')
    expect(results[0].items[0].matchedField).toBe('tailoredFor')
  })

  it('finds resume by extracted PDF body text using textIndexMap', () => {
    const textMap = new Map<string, string>()
    textMap.set('res-1', 'This candidate holds patent US-9872134 regarding transformer attention caching.')

    const results = searchResumes('transformer attention', dummyResumes, dummyCategories, textMap)
    expect(results.length).toBe(1)
    expect(results[0].items[0].resume.id).toBe('res-1')
    expect(results[0].items[0].matchedField).toBe('pdfContent')
  })

  it('returns empty array when query does not match anything', () => {
    const results = searchResumes('nonexistent-term-xyz', dummyResumes, dummyCategories)
    expect(results.length).toBe(0)
  })
})
