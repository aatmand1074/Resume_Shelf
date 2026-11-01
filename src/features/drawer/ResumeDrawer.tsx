import React from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/Drawer'
import { PdfPreview } from './PdfPreview'
import { ResumeActions } from './ResumeActions'
import { storageAdapter } from '@/storage/hooks'
import { downloadResumeFile } from '@/services/download'
import { TagInput } from '@/components/ui/TagInput'
import { Button } from '@/components/ui/Button'
import { LIMITS } from '@/domain/limits'
import type { Category, Resume, ResumeFile } from '@/domain/types'
import { Calendar, Tag, Building, ArrowDownToLine, Edit3, Check } from 'lucide-react'

export interface ResumeDrawerContentProps {
  resume: Resume
  categories: Category[]
  onUpdateResume: (updated: Resume) => Promise<void>
  onDeleteResume: (id: string) => Promise<void>
  onReplaceFileRequested?: (resume: Resume) => void
  onClose: () => void
}

export const ResumeDrawerContent: React.FC<ResumeDrawerContentProps> = ({
  resume,
  categories,
  onUpdateResume,
  onDeleteResume,
  onReplaceFileRequested,
  onClose,
}) => {
  const [fileEntry, setFileEntry] = React.useState<ResumeFile | undefined>(undefined)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [editingSkills, setEditingSkills] = React.useState(false)
  const [currentSkills, setCurrentSkills] = React.useState<string[]>(resume.skills)

  // Fetch binary blob when resume is loaded
  React.useEffect(() => {
    let active = true
    storageAdapter.files
      .get(resume.id)
      .then((file) => {
        if (active) setFileEntry(file)
      })
      .catch((err: unknown) => {
        console.warn('Could not load resume file blob:', err)
      })

    return () => {
      active = false
    }
  }, [resume.id])

  const category = categories.find((c) => c.id === resume.categoryId)
  const categoryName = category?.name || 'General'

  const handleDownload = (): void => {
    void downloadResumeFile(resume, categoryName, storageAdapter)
  }

  const handleTogglePin = (): void => {
    void onUpdateResume({
      ...resume,
      pinned: !resume.pinned,
      updatedAt: Date.now(),
    })
  }

  const handleDuplicate = (): void => {
    const duplicated: Resume = {
      ...resume,
      id: crypto.randomUUID(),
      title: `${resume.title} (Copy)`,
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      downloadCount: 0,
    }
    void onUpdateResume(duplicated)
  }

  const handleMoveShelf = (newCategoryId: string): void => {
    void onUpdateResume({
      ...resume,
      categoryId: newCategoryId,
      updatedAt: Date.now(),
    })
  }

  const handleSaveSkills = (): void => {
    void onUpdateResume({
      ...resume,
      skills: currentSkills,
      updatedAt: Date.now(),
    }).then(() => {
      setEditingSkills(false)
    })
  }

  const handleDelete = (): void => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    void onDeleteResume(resume.id).then(() => {
      setConfirmDelete(false)
      onClose()
    })
  }

  return (
    <>
      <DrawerHeader>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: resume.spineColor }}
          />
          <DrawerTitle>{resume.title}</DrawerTitle>
        </div>
        <DrawerDescription>
          {categoryName} · {resume.version || 'v1.0'} · {(resume.sizeBytes / 1024).toFixed(0)} KB
        </DrawerDescription>
      </DrawerHeader>

      <div className="p-6 space-y-6">
        {/* First Page Preview */}
        <PdfPreview
          blob={fileEntry?.blob}
          mimeType={resume.mimeType}
          fileName={resume.fileName}
        />

        {/* Action CTAs */}
        <ResumeActions
          resume={resume}
          categories={categories}
          onDownload={handleDownload}
          onTogglePin={handleTogglePin}
          onDuplicate={handleDuplicate}
          onMoveShelf={handleMoveShelf}
          onReplaceFile={() => {
            onReplaceFileRequested?.(resume)
          }}
          onDelete={handleDelete}
        />

        {confirmDelete && (
          <div className="p-3 rounded-[var(--radius-md)] bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between animate-in fade-in">
            <span>Permanently delete this resume and its file?</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(false)
                }}
                className="px-2 py-1 rounded-[var(--radius-sm)] border border-red-200 bg-white font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-2 py-1 rounded-[var(--radius-sm)] bg-red-600 text-white font-medium cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* Metadata Specifications */}
        <div className="space-y-3 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-ink)]">
          {resume.headline && (
            <div>
              <span className="font-semibold text-[var(--color-muted)] block mb-0.5">Headline</span>
              <p className="font-medium">{resume.headline}</p>
            </div>
          )}

          {resume.summary && (
            <div>
              <span className="font-semibold text-[var(--color-muted)] block mb-0.5">Summary</span>
              <p className="text-[var(--color-muted)] leading-relaxed whitespace-pre-line">
                {resume.summary}
              </p>
            </div>
          )}

          {resume.tailoredFor && (
            <div className="flex items-center gap-1.5 text-[var(--color-muted)]">
              <Building className="w-3.5 h-3.5" />
              <span>Tailored For: <strong className="text-[var(--color-ink)]">{resume.tailoredFor}</strong></span>
            </div>
          )}

          {/* Editable Skills Section */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--color-muted)] flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Skills Summary ({currentSkills.length.toString()})
              </span>
              {!editingSkills ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSkills(true)
                  }}
                  className="flex items-center gap-1 text-[11px] text-[var(--color-walnut)] hover:underline cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit Skills
                </button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveSkills}
                  className="h-6 px-2 text-[10px] gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  Save Skills
                </Button>
              )}
            </div>

            {editingSkills ? (
              <div className="pt-1 animate-in fade-in">
                <TagInput
                  tags={currentSkills}
                  onChange={setCurrentSkills}
                  maxTags={LIMITS.SKILLS_MAX}
                  placeholder="Add skill..."
                />
              </div>
            ) : currentSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {currentSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] font-medium text-[11px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-muted)] italic">
                No skills tagged. Click &quot;Edit Skills&quot; to tag skills for this resume.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-muted)]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Updated {new Date(resume.updatedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <ArrowDownToLine className="w-3 h-3" />
              Downloaded {resume.downloadCount.toString()} time(s)
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export interface ResumeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resume?: Resume
  categories: Category[]
  onUpdateResume: (updated: Resume) => Promise<void>
  onDeleteResume: (id: string) => Promise<void>
  onReplaceFileRequested?: (resume: Resume) => void
}

export const ResumeDrawer: React.FC<ResumeDrawerProps> = ({
  open,
  onOpenChange,
  resume,
  categories,
  onUpdateResume,
  onDeleteResume,
  onReplaceFileRequested,
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="overflow-y-auto">
        {open && resume && (
          <ResumeDrawerContent
            key={resume.id}
            resume={resume}
            categories={categories}
            onUpdateResume={onUpdateResume}
            onDeleteResume={onDeleteResume}
            onReplaceFileRequested={onReplaceFileRequested}
            onClose={() => {
              onOpenChange(false)
            }}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}
