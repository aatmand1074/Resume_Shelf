import React from 'react'
import {
  useSpaces,
  useCategories,
  useResumes,
  storageAdapter,
} from '@/storage/hooks'
import { DEFAULT_SPACE_ID, seedInitialDataIfNeeded } from '@/storage/seed'
import { Shelf } from './Shelf'
import { CategoryDialog, useCategoryActions } from '@/features/categories'
import { DropOverlay, UploadDialog } from '@/features/upload'
import { ResumeDrawer } from '@/features/drawer'
import { CommandPalette, invalidateTextIndexCache } from '@/features/search'
import { Button } from '@/components/ui/Button'
import { downloadResumeFile } from '@/services/download'
import { requestPersistentStorage } from '@/services/persistence'
import type { Category, Resume, ResumeFile, TextIndexEntry } from '@/domain/types'
import { Plus, Search, BookOpen, Sun, Moon } from 'lucide-react'

export const ShelfPage: React.FC = () => {
  const [activeSpaceId] = React.useState(DEFAULT_SPACE_ID)
  const [selectedCategory, setSelectedCategory] = React.useState<Category | undefined>(undefined)
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false)

  // Modals & drawers state
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
  const [droppedFile, setDroppedFile] = React.useState<File | undefined>(undefined)
  const [uploadTargetCategory, setUploadTargetCategory] = React.useState<Category | undefined>(undefined)
  const [drawerResume, setDrawerResume] = React.useState<Resume | undefined>(undefined)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  // Phase 4: Command Palette state
  const [searchPaletteOpen, setSearchPaletteOpen] = React.useState(false)

  const [darkMode, setDarkMode] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Seed default space and starter categories on first load if empty
  React.useEffect(() => {
    void seedInitialDataIfNeeded(storageAdapter)
    void requestPersistentStorage()
  }, [])

  // Phase 4: Global keyboard shortcut listener for / and Cmd/Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Avoid triggering when user is currently typing in an input or textarea
      const target = e.target as HTMLElement | null
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable

      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !isInput)) {
        e.preventDefault()
        setSearchPaletteOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const spaces = useSpaces()
  const categories = useCategories(activeSpaceId)
  const resumes = useResumes(activeSpaceId)

  // Encapsulated category business logic hook
  const { saveCategory, deleteCategory } = useCategoryActions(categories?.length || 0)

  const activeSpace = spaces?.find((s) => s.id === activeSpaceId) || {
    id: DEFAULT_SPACE_ID,
    name: 'My Library',
    tagline: 'Personal Resume Shelves',
  }

  const showNotification = (msg: string): void => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  const toggleDarkMode = (): void => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark', !darkMode)
  }

  const handleSaveCategory = async (name: string, color: string): Promise<void> => {
    await saveCategory(activeSpaceId, name, color, selectedCategory)
  }

  const handleDeleteCategory = async (id: string): Promise<void> => {
    await deleteCategory(id)
  }

  // Open Drawer on Book click
  const handleBookClick = (resume: Resume): void => {
    setDrawerResume(resume)
    setDrawerOpen(true)
  }

  // Quick download with Shift+Enter
  const handleQuickDownload = async (resume: Resume): Promise<void> => {
    try {
      const category = categories?.find((c) => c.id === resume.categoryId)
      const categoryName = category?.name || 'General'
      await downloadResumeFile(resume, categoryName, storageAdapter)
      showNotification(`Downloading ${resume.title}...`)
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : 'Download failed')
    }
  }

  // Full-page file drop
  const handleFileDrop = (file: File): void => {
    setDroppedFile(file)
    setUploadTargetCategory(undefined)
    setUploadDialogOpen(true)
  }

  // Save new resume from UploadDialog
  const handleSaveResume = async (
    newResume: Resume,
    file?: ResumeFile,
    textIndex?: TextIndexEntry
  ): Promise<void> => {
    await storageAdapter.resumes.save(newResume, file, textIndex)
    invalidateTextIndexCache()
    showNotification(`Added "${newResume.title}" to shelf!`)
  }

  // Update existing resume from Drawer
  const handleUpdateResume = async (updated: Resume): Promise<void> => {
    await storageAdapter.resumes.save(updated)
    setDrawerResume(updated)
    invalidateTextIndexCache()
    showNotification('Resume updated')
  }

  // Delete resume from Drawer
  const handleDeleteResume = async (id: string): Promise<void> => {
    await storageAdapter.resumes.delete(id)
    invalidateTextIndexCache()
    showNotification('Resume deleted')
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col transition-colors duration-200">
      {/* Full-Page Drag and Drop Overlay */}
      <DropOverlay onFileDrop={handleFileDrop} />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl text-xs font-medium text-[var(--color-ink)] animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

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
          {/* Phase 4: Search Trigger */}
          <button
            type="button"
            onClick={() => {
              setSearchPaletteOpen(true)
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

          {/* Add Resume Button */}
          <Button
            size="sm"
            onClick={() => {
              setDroppedFile(undefined)
              setUploadTargetCategory(undefined)
              setUploadDialogOpen(true)
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
                  onQuickDownload={(res) => {
                    void handleQuickDownload(res)
                  }}
                  onAddBookClick={(cat) => {
                    setUploadTargetCategory(cat)
                    setDroppedFile(undefined)
                    setUploadDialogOpen(true)
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
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

      {/* Upload Dialog */}
      {categories && (
        <UploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          categories={categories}
          activeSpaceId={activeSpaceId}
          targetCategory={uploadTargetCategory}
          initialFile={droppedFile}
          onSave={handleSaveResume}
        />
      )}

      {/* Resume Preview & Actions Drawer */}
      {categories && (
        <ResumeDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          resume={drawerResume}
          categories={categories}
          onUpdateResume={handleUpdateResume}
          onDeleteResume={handleDeleteResume}
          onReplaceFileRequested={(res) => {
            setDrawerOpen(false)
            setUploadTargetCategory(categories.find((c) => c.id === res.categoryId))
            setUploadDialogOpen(true)
          }}
        />
      )}

      {/* Phase 4: Command Palette Search */}
      {categories && resumes && (
        <CommandPalette
          open={searchPaletteOpen}
          onOpenChange={setSearchPaletteOpen}
          resumes={resumes}
          categories={categories}
          onSelectResume={handleBookClick}
          onQuickDownload={(res) => {
            void handleQuickDownload(res)
          }}
        />
      )}
    </div>
  )
}
