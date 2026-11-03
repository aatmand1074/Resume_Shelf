import React from 'react'
import {
  useSpaces,
  useCategories,
  useResumes,
  useMeta,
  storageAdapter,
} from '@/storage/hooks'
import { DEFAULT_SPACE_ID, seedInitialDataIfNeeded } from '@/storage/seed'
import { Shelf } from './Shelf'
import { CategoryDialog, useCategoryActions } from '@/features/categories'
import { DropOverlay, UploadDialog } from '@/features/upload'
import { ResumeDrawer } from '@/features/drawer'
import { CommandPalette, invalidateTextIndexCache } from '@/features/search'
import { BackupMenu, BackupReminderBanner } from '@/features/backup'
import { OnboardingDialog } from '@/features/onboarding'
import { SettingsDialog } from '@/features/settings'
import { Button } from '@/components/ui/Button'
import { downloadResumeFile } from '@/services/download'
import { requestPersistentStorage } from '@/services/persistence'
import type { Category, Resume, ResumeFile, TextIndexEntry } from '@/domain/types'
import { Plus, Search, BookOpen, Sun, Moon, HardDrive, Settings, AlertTriangle } from 'lucide-react'

function usePrivateBrowsingWarning(): boolean {
  const [isPrivate, setIsPrivate] = React.useState(false)
  React.useEffect(() => {
    void (async () => {
      try {
        const testKey = '__rs_storage_test__'
        localStorage.setItem(testKey, '1')
        localStorage.removeItem(testKey)
        // Also verify IndexedDB is writable
        const testReq = indexedDB.open('__rs_idb_test__', 1)
        testReq.onerror = () => { setIsPrivate(true) }
        testReq.onsuccess = () => {
          testReq.result.close()
          indexedDB.deleteDatabase('__rs_idb_test__')
        }
      } catch {
        setIsPrivate(true)
      }
    })()
  }, [])
  return isPrivate
}

export const ShelfPage: React.FC = () => {
  const [activeSpaceId] = React.useState(DEFAULT_SPACE_ID)
  const [selectedCategory, setSelectedCategory] = React.useState<Category | undefined>(undefined)
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false)

  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
  const [droppedFile, setDroppedFile] = React.useState<File | undefined>(undefined)
  const [uploadTargetCategory, setUploadTargetCategory] = React.useState<Category | undefined>(undefined)
  const [drawerResume, setDrawerResume] = React.useState<Resume | undefined>(undefined)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const [searchPaletteOpen, setSearchPaletteOpen] = React.useState(false)
  const [backupMenuOpen, setBackupMenuOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  const [darkMode, setDarkMode] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  const [storageError, setStorageError] = React.useState<string | null>(null)

  const isPrivateBrowsing = usePrivateBrowsingWarning()

  const onboardingComplete = useMeta('onboardingComplete') as boolean | undefined
  const [onboardingDialogOpen, setOnboardingDialogOpen] = React.useState(false)

  React.useEffect(() => {
    void seedInitialDataIfNeeded(storageAdapter)
    void requestPersistentStorage()
  }, [])

  // Show onboarding once storage is ready and onboarding not done
  React.useEffect(() => {
    if (onboardingComplete === false || onboardingComplete === undefined) {
      // useMeta returns undefined while loading; wait for it to resolve
      // We use a small heuristic: if onboardingComplete key returns explicitly false/undefined
      // after the first render cycle, open the dialog
      const timer = setTimeout(() => {
        void storageAdapter.meta.get('onboardingComplete').then((val) => {
          if (!val) setOnboardingDialogOpen(true)
        })
      }, 300)
      return () => { clearTimeout(timer) }
    }
  }, [onboardingComplete])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement | null
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !isInput)) {
        e.preventDefault()
        setSearchPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [])

  const spaces = useSpaces()
  const categories = useCategories(activeSpaceId)
  const resumes = useResumes(activeSpaceId)

  const { saveCategory, deleteCategory } = useCategoryActions(categories?.length || 0)

  const activeSpace = spaces?.find((s) => s.id === activeSpaceId) || {
    id: DEFAULT_SPACE_ID,
    name: 'My Library',
    tagline: 'Personal Resume Shelves',
    createdAt: Date.now(),
  }

  const showNotification = (msg: string): void => {
    setToastMessage(msg)
    setTimeout(() => { setToastMessage(null) }, 3500)
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

  const handleBookClick = (resume: Resume): void => {
    setDrawerResume(resume)
    setDrawerOpen(true)
  }

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

  const handleFileDrop = (file: File): void => {
    setDroppedFile(file)
    setUploadTargetCategory(undefined)
    setUploadDialogOpen(true)
  }

  const handleSaveResume = async (
    newResume: Resume,
    file?: ResumeFile,
    textIndex?: TextIndexEntry
  ): Promise<void> => {
    try {
      await storageAdapter.resumes.save(newResume, file, textIndex)
      invalidateTextIndexCache()
      showNotification(`Added "${newResume.title}" to shelf!`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('storage')) {
        setStorageError('Storage is full. Delete some resumes or clear browser data to continue.')
      } else {
        showNotification('Failed to save resume.')
      }
      throw err
    }
  }

  const handleUpdateResume = async (updated: Resume): Promise<void> => {
    await storageAdapter.resumes.save(updated)
    setDrawerResume(updated)
    invalidateTextIndexCache()
    showNotification('Resume updated')
  }

  const handleDeleteResume = async (id: string): Promise<void> => {
    await storageAdapter.resumes.delete(id)
    invalidateTextIndexCache()
    showNotification('Resume deleted')
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col transition-colors duration-300">
      <DropOverlay onFileDrop={handleFileDrop} />

      {/* Private-browsing warning */}
      {isPrivateBrowsing && (
        <div
          role="alert"
          className="flex items-center gap-3 px-4 sm:px-8 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs rs-slide-down"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Private browsing detected — your resumes won&apos;t persist after this session. Open
            Resume Shelf in a regular window to save data.
          </span>
        </div>
      )}

      {/* Storage-full error */}
      {storageError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 px-4 sm:px-8 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs rs-slide-down"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {storageError}
          </span>
          <button
            type="button"
            onClick={() => { setStorageError(null) }}
            className="underline hover:text-red-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Backup reminder banner */}
      <BackupReminderBanner onOpenBackup={() => { setBackupMenuOpen(true) }} />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-[var(--radius-lg)] bg-[var(--color-walnut)] text-white shadow-[var(--shadow-card)] text-xs font-medium rs-toast-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--color-border)] px-4 sm:px-8 py-3.5 flex items-center justify-between rs-slide-down"
        style={{
          background: 'linear-gradient(135deg, var(--color-paper) 0%, color-mix(in srgb, var(--color-paper) 92%, var(--color-walnut)) 100%)',
        }}
      >
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-xl shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--color-walnut) 0%, var(--color-accent) 100%)',
              boxShadow: '0 2px 8px rgba(21,74,69,0.3)',
            }}
          >
            📚
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-[var(--color-walnut)] leading-tight tracking-tight">
              {activeSpace.name}
            </h1>
            <p className="text-xs text-[var(--color-muted)] hidden sm:block">
              {activeSpace.tagline || 'Visual Resume Bookshelf'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            type="button"
            onClick={() => { setSearchPaletteOpen(true) }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]/80 text-xs text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)] transition-all duration-150 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Quick Search...</span>
            <kbd className="hidden md:inline-block font-mono text-[10px] bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-1.5 py-0.5 rounded-[var(--radius-sm)]">
              /
            </kbd>
          </button>

          {/* Backup */}
          <Button variant="outline" size="icon" onClick={() => { setBackupMenuOpen(true) }} aria-label="Backup" title="Backup & Restore">
            <HardDrive className="w-4 h-4" />
          </Button>

          {/* Settings */}
          <Button variant="outline" size="icon" onClick={() => { setSettingsOpen(true) }} aria-label="Settings" title="Settings">
            <Settings className="w-4 h-4" />
          </Button>

          {/* New Shelf */}
          <Button
            variant="teal"
            size="sm"
            onClick={() => {
              setSelectedCategory(undefined)
              setCategoryDialogOpen(true)
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Shelf</span>
          </Button>

          {/* Add Resume */}
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

          {/* Dark Mode */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle theme">
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
        {!categories || categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-5 rs-scale-in">
            {/* Decorative book stack */}
            <div className="flex items-end gap-1.5 mb-2">
              {['var(--spine-0)','var(--spine-1)','var(--spine-2)','var(--spine-3)','var(--spine-4)'].map((c, i) => (
                <div
                  key={i}
                  className="w-5 rounded-t-sm"
                  style={{
                    height: `${48 + i * 8}px`,
                    backgroundColor: c,
                    boxShadow: '1px 2px 6px rgba(3,28,22,0.18)',
                  }}
                />
              ))}
            </div>
            <h2 className="font-serif text-2xl font-bold text-[var(--color-walnut)]">
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
              <Plus className="w-4 h-4" />
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
                  onQuickDownload={(res) => { void handleQuickDownload(res) }}
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

      <footer className="border-t border-[var(--color-border)] py-5 text-center text-xs text-[var(--color-muted)]">
        <div className="flex items-center justify-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
          <span>Resume Shelf</span>
          <span className="text-[var(--color-border)]">·</span>
          <span>Local browser storage (IndexedDB)</span>
          <span className="text-[var(--color-border)]">·</span>
          <span>No data sent to any server</span>
        </div>
      </footer>

      {/* Dialogs & overlays */}
      <CategoryDialog
        open={categoryDialogOpen}
        category={selectedCategory}
        onOpenChange={setCategoryDialogOpen}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

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

      {categories && resumes && (
        <CommandPalette
          open={searchPaletteOpen}
          onOpenChange={setSearchPaletteOpen}
          resumes={resumes}
          categories={categories}
          onSelectResume={handleBookClick}
          onQuickDownload={(res) => { void handleQuickDownload(res) }}
        />
      )}

      <BackupMenu
        open={backupMenuOpen}
        onOpenChange={setBackupMenuOpen}
        onSuccess={showNotification}
      />

      <SettingsDialog
        open={settingsOpen}
        space={activeSpace}
        onOpenChange={setSettingsOpen}
        onSuccess={showNotification}
      />

      <OnboardingDialog
        open={onboardingDialogOpen}
        onDone={() => { setOnboardingDialogOpen(false) }}
      />
    </div>
  )
}
