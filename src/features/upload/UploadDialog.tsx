import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { TagInput } from '@/components/ui/TagInput'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { extractPdfMetadata } from '@/services/pdf'
import {
  inferRoleFromText,
  matchBestCategory,
  type RoleProfileMatch,
} from '@/domain/skills'
import { getDefaultSpineColor } from '@/domain/types'
import { LIMITS } from '@/domain/limits'
import type { Category, ID, Resume, ResumeFile, TextIndexEntry } from '@/domain/types'
import { FileText, Sparkles, Loader2, Compass } from 'lucide-react'

export interface UploadFormContentProps {
  categories: Category[]
  activeSpaceId: ID
  targetCategory?: Category
  initialFile?: File
  onClose: () => void
  onSave: (resume: Resume, file?: ResumeFile, textIndex?: TextIndexEntry) => Promise<void>
}

export const UploadFormContent: React.FC<UploadFormContentProps> = ({
  categories,
  activeSpaceId,
  targetCategory,
  initialFile,
  onClose,
  onSave,
}) => {
  const [file, setFile] = React.useState<File | undefined>(initialFile)
  const [title, setTitle] = React.useState(
    initialFile ? initialFile.name.replace(/\.[^/.]+$/, '') : ''
  )
  const [categoryId, setCategoryId] = React.useState<string>(
    targetCategory ? targetCategory.id : (categories[0]?.id ?? '')
  )
  const [version, setVersion] = React.useState('v1.0')
  const [headline, setHeadline] = React.useState('')
  const [summary, setSummary] = React.useState('')
  const [skills, setSkills] = React.useState<string[]>([])
  const [tailoredFor, setTailoredFor] = React.useState('')
  const [spineColor, setSpineColor] = React.useState(
    initialFile ? getDefaultSpineColor(initialFile.name) : ''
  )
  const [pageCount, setPageCount] = React.useState<number | undefined>(1)
  const [extractedText, setExtractedText] = React.useState('')
  const [suggestedSkills, setSuggestedSkills] = React.useState<string[]>([])
  const [detectedRole, setDetectedRole] = React.useState<RoleProfileMatch | null>(null)

  const [loading, setLoading] = React.useState(false)
  const [extracting, setExtracting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const processSelectedFile = (selectedFile: File): void => {
    setFile(selectedFile)
    const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
    setTitle(nameWithoutExt)
    setSpineColor(getDefaultSpineColor(selectedFile.name))

    if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
      setExtracting(true)
      extractPdfMetadata(selectedFile)
        .then((res) => {
          setPageCount(res.pageCount)
          setExtractedText(res.text)
          setSuggestedSkills(res.suggestedSkills)

          // 1. Infer what role this resume is for based on text content
          const roleMatch = inferRoleFromText(res.text)
          setDetectedRole(roleMatch)

          // 2. Set role headline if empty
          setHeadline((prev) => (prev ? prev : `${roleMatch.suggestedRole} with technical expertise`))

          // 3. Automatically select the best shelf category matching the detected role
          if (!targetCategory && categories.length > 0) {
            const bestCatId = matchBestCategory(roleMatch.suggestedRole, categories)
            if (bestCatId) {
              setCategoryId(bestCatId)
            }
          }

          // 4. Pre-populate skills summary tags with top detected skills
          if (res.suggestedSkills.length > 0) {
            setSkills((prev) => (prev.length === 0 ? res.suggestedSkills.slice(0, 6) : prev))
          }
        })
        .catch((err: unknown) => {
          console.warn('PDF extraction skipped or failed:', err)
        })
        .finally(() => {
          setExtracting(false)
        })
    } else {
      setPageCount(1)
      setExtractedText('')
      setSuggestedSkills([])
      setDetectedRole(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.size > LIMITS.FILE_SIZE_MAX) {
        setError(`File size exceeds 10 MB limit (${(selected.size / (1024 * 1024)).toFixed(1)} MB).`)
        return
      }
      setError(null)
      processSelectedFile(selected)
    }
  }

  const handleAddSuggestedSkill = (skill: string): void => {
    if (!skills.includes(skill) && skills.length < LIMITS.SKILLS_MAX) {
      setSkills([...skills, skill])
    }
    setSuggestedSkills(suggestedSkills.filter((s) => s !== skill))
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!file) {
      setError('Please select a resume file (PDF or DOCX).')
      return
    }
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!categoryId) {
      setError('Please select a shelf.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const resumeId = crypto.randomUUID()
      const now = Date.now()

      const arrayBuffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const sha256 = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

      const newResume: Resume = {
        id: resumeId,
        spaceId: activeSpaceId,
        categoryId,
        title: title.trim(),
        version: version.trim() || 'v1',
        headline: headline.trim(),
        summary: summary.trim(),
        skills,
        tailoredFor: tailoredFor.trim() || undefined,
        spineColor: spineColor || getDefaultSpineColor(resumeId),
        pinned: false,
        fileName: file.name,
        mimeType: file.type || 'application/pdf',
        sizeBytes: file.size,
        pageCount,
        createdAt: now,
        updatedAt: now,
        downloadCount: 0,
      }

      const fileEntry: ResumeFile = {
        resumeId,
        blob: file,
        sha256,
      }

      const textIndexEntry: TextIndexEntry = {
        resumeId,
        extractedText,
      }

      await onSave(newResume, fileEntry, textIndexEntry)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save resume.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-4 pt-2">
      {error && (
        <div className="p-3 rounded-[var(--radius-md)] bg-red-50 text-red-700 text-xs border border-red-200">
          {error}
        </div>
      )}

      {/* File Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[var(--color-ink)] flex items-center justify-between">
          <span>Resume File (PDF, DOCX)</span>
          {extracting && (
            <span className="flex items-center text-xs text-[var(--color-muted)]">
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              Reading resume & analyzing role...
            </span>
          )}
        </label>
        <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-raised)]">
          <FileText className="w-6 h-6 text-[var(--color-walnut)] shrink-0" />
          <div className="flex-1 min-w-0">
            {file ? (
              <p className="text-xs font-medium text-[var(--color-ink)] truncate">
                {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </p>
            ) : (
              <p className="text-xs text-[var(--color-muted)]">No file chosen</p>
            )}
          </div>
          <label className="cursor-pointer">
            <span className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-walnut)] transition-colors">
              Browse
            </span>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Role Detection Banner */}
      {detectedRole && (
        <div className="p-3 rounded-[var(--radius-md)] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
          <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs">
                Detected Target Role: <u>{detectedRole.suggestedRole}</u>
              </span>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                {detectedRole.confidence}% match
              </span>
            </div>
            {detectedRole.matchedKeywords.length > 0 && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
                Matched signals: {detectedRole.matchedKeywords.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Title & Shelf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="resume-title" className="text-xs font-semibold text-[var(--color-ink)]">
            Resume Title
          </label>
          <Input
            id="resume-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
            }}
            placeholder="e.g. Senior Data Analyst"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="shelf-select" className="text-xs font-semibold text-[var(--color-ink)]">
            Target Shelf {detectedRole && <span className="text-[10px] text-emerald-600 font-normal">(Auto-matched)</span>}
          </label>
          <select
            id="shelf-select"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
            }}
            className="w-full h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs text-[var(--color-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-walnut)]"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Version & Tailored For */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="resume-version" className="text-xs font-semibold text-[var(--color-ink)]">
            Version Tag
          </label>
          <Input
            id="resume-version"
            value={version}
            onChange={(e) => {
              setVersion(e.target.value)
            }}
            placeholder="e.g. v1.0, 2026-Q1"
            maxLength={20}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="resume-tailored" className="text-xs font-semibold text-[var(--color-ink)]">
            Tailored For (Company/Role)
          </label>
          <Input
            id="resume-tailored"
            value={tailoredFor}
            onChange={(e) => {
              setTailoredFor(e.target.value)
            }}
            placeholder="e.g. Stripe, DeepMind"
            maxLength={50}
          />
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-1.5">
        <label htmlFor="resume-headline" className="text-xs font-semibold text-[var(--color-ink)]">
          Role Headline (max {LIMITS.HEADLINE_MAX.toString()} chars)
        </label>
        <Input
          id="resume-headline"
          value={headline}
          onChange={(e) => {
            setHeadline(e.target.value)
          }}
          placeholder="e.g. Full-Stack Engineer with 5+ yrs TypeScript & React experience"
          maxLength={LIMITS.HEADLINE_MAX}
        />
      </div>

      {/* Summary */}
      <div className="space-y-1.5">
        <label htmlFor="resume-summary" className="text-xs font-semibold text-[var(--color-ink)]">
          Executive Summary (max {LIMITS.SUMMARY_MAX.toString()} chars)
        </label>
        <Textarea
          id="resume-summary"
          value={summary}
          onChange={(e) => {
            setSummary(e.target.value)
          }}
          placeholder="Brief summary of skills, achievements, or target role..."
          maxLength={LIMITS.SUMMARY_MAX}
          rows={3}
        />
      </div>

      {/* Skills & Suggested Skills */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[var(--color-ink)] flex items-center justify-between">
          <span>Skills Summary ({skills.length.toString()} / {LIMITS.SKILLS_MAX.toString()})</span>
          <span className="text-[10px] text-[var(--color-muted)] font-normal">Auto-detected from resume</span>
        </label>
        <TagInput
          tags={skills}
          onChange={setSkills}
          maxTags={LIMITS.SKILLS_MAX}
          placeholder="Add skill (press Enter)..."
        />

        {suggestedSkills.length > 0 && (
          <div className="pt-1.5">
            <span className="text-[11px] font-medium text-[var(--color-muted)] flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Additional detected skills (click to add):
            </span>
            <div className="flex flex-wrap gap-1">
              {suggestedSkills.slice(0, 10).map((suggested) => (
                <button
                  key={suggested}
                  type="button"
                  onClick={() => {
                    handleAddSuggestedSkill(suggested)
                  }}
                  className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  + {suggested}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spine Accent Color */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-[var(--color-ink)]">
          Book Spine Color
        </label>
        <ColorPicker value={spineColor} onChange={setSpineColor} />
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading || !file}>
          {loading ? 'Adding...' : 'Add Resume to Shelf'}
        </Button>
      </div>
    </form>
  )
}

export interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  activeSpaceId: ID
  targetCategory?: Category
  initialFile?: File
  onSave: (resume: Resume, file?: ResumeFile, textIndex?: TextIndexEntry) => Promise<void>
}

export const UploadDialog: React.FC<UploadDialogProps> = ({
  open,
  onOpenChange,
  categories,
  activeSpaceId,
  targetCategory,
  initialFile,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Resume to Shelf</DialogTitle>
          <DialogDescription>
            Upload your resume. The app automatically analyzes its text to classify the target role, pick the shelf, and extract skills.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <UploadFormContent
            categories={categories}
            activeSpaceId={activeSpaceId}
            targetCategory={targetCategory}
            initialFile={initialFile}
            onClose={() => {
              onOpenChange(false)
            }}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
