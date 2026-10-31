import React from 'react'
import {
  useSpaces,
  useCategories,
  useResumes,
  storageAdapter,
} from '@/storage/hooks'
import { DEFAULT_SPACE_ID, seedInitialDataIfNeeded } from '@/storage/seed'
import { Shelf } from './Shelf'
import { CategoryDialog } from '@/features/categories/CategoryDialog'
import { Button } from '@/components/ui/Button'
import type { Category, Resume } from '@/domain/types'
import { Plus, Search, BookOpen, Sun, Moon } from 'lucide-react'

export const ShelfPage: React.FC = () => {
  const [activeSpaceId] = React.useState(DEFAULT_SPACE_ID)
  const [selectedCategory, setSelectedCategory] = React.useState<Category | undefined>(undefined)
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false)
  const [darkMode, setDarkMode] = React.useState(false)

  // Seed default space and starter categories on first load if empty
  React.useEffect(() => {
    void seedInitialDataIfNeeded(storageAdapter)
  }, [])

  const spaces = useSpaces()
  const categories = useCategories(activeSpaceId)
  const resumes = useResumes(activeSpaceId)

  const activeSpace = spaces?.find((s) => s.id === activeSpaceId) || {
    id: DEFAULT_SPACE_ID,
    name: 'My Library',
    tagline: 'Personal Resume Shelves',
  }

  const toggleDarkMode = (): void => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark', !darkMode)
  }

  const handleCreateCategory = async (name: string, color: string): Promise<void> => {
    if (selectedCategory) {
      await storageAdapter.categories.save({
        ...selectedCategory,
        name,
        color,
      })
    } else {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        spaceId: activeSpaceId,
        name,
        color,
        order: (categories?.length || 0),
        createdAt: Date.now(),
      }
      await storageAdapter.categories.save(newCategory)
    }
  }

  const handleDeleteCategory = async (id: string): Promise<void> => {
    await storageAdapter.categories.delete(id)
  }

  const handleBookClick = (resume: Resume): void => {
    // Will open Drawer in Phase 3
    alert(`Resume clicked: ${resume.title}\n(Preview and Download drawer will open in Phase 3!)`)
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col transition-colors duration-200">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-[var(--color-paper)]/85 backdrop-blur-md border-b border-[var(--color-border)] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl drop-shadow-xs">📚</span>
          <div>
            <h1 className="font-serif font-bold text-xl text-[var(--color-walnut)] leading-tight tracking-tight">
              {activeSpace.name}
            </h1>
            <p className="text-xs text-[var(--color-muted)] hidden sm:block">
              {activeSpace.tagline || 'Visual Resume Bookshelf'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => {
              alert('Search Command Palette opens in Phase 4 (shortcut: / or Cmd+K)')
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-muted)] hover:border-[var(--color-walnut)] transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Quick Search...</span>
            <kbd className="hidden md:inline-block font-mono text-[10px] bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-1.5 py-0.5 rounded-xs">
              /
            </kbd>
          </button>

          {/* New Shelf Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory(undefined)
              setCategoryDialogOpen(true)
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Shelf</span>
          </Button>

          {/* Add Resume Button (Placeholder for Phase 3 upload modal) */}
          <Button
            size="sm"
            onClick={() => {
              alert('Upload modal opens in Phase 3! You can drop any PDF/DOCX or click + on a shelf.')
            }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Add Resume</span>
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main Shelves Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
        {!categories || categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <span className="text-4xl">📖</span>
            <h2 className="font-serif text-xl font-bold text-[var(--color-walnut)]">
              Your Bookshelf is Ready
            </h2>
            <p className="text-sm text-[var(--color-muted)] max-w-sm">
              Create your first shelf or choose starter shelves to organize your resumes by role.
            </p>
            <Button
              onClick={() => {
                setSelectedCategory(undefined)
                setCategoryDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create First Shelf
            </Button>
          </div>
        ) : (
          <div>
            {categories.map((category) => {
              const categoryResumes = (resumes || []).filter((r) => r.categoryId === category.id)
              return (
                <Shelf
                  key={category.id}
                  category={category}
                  resumes={categoryResumes}
                  onBookClick={handleBookClick}
                  onAddBookClick={(cat) => {
                    alert(`Add resume to shelf: ${cat.name}\n(Upload modal opens in Phase 3!)`)
                  }}
                  onEditCategory={(cat) => {
                    setSelectedCategory(cat)
                    setCategoryDialogOpen(true)
                  }}
                />
              )
            })}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-[var(--color-border)] py-4 text-center text-xs text-[var(--color-muted)]">
        <p>Resume Shelf · Local browser storage (IndexedDB) · No data sent to any server</p>
      </footer>

      {/* Category Creation / Edit Dialog */}
      <CategoryDialog
        open={categoryDialogOpen}
        category={selectedCategory}
        onOpenChange={setCategoryDialogOpen}
        onSave={handleCreateCategory}
        onDelete={handleDeleteCategory}
      />
    </div>
  )
}
