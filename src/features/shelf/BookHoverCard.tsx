import React from 'react'
import type { Resume } from '@/domain/types'
import { HoverCardContent } from '@/components/ui/HoverCard'
import { Download, Calendar, HardDrive, Tag } from 'lucide-react'

export interface BookHoverCardProps {
  resume: Resume
}

export const BookHoverCard: React.FC<BookHoverCardProps> = ({ resume }) => {
  const updatedDate = new Date(resume.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const sizeKb = (resume.sizeBytes / 1024).toFixed(1)

  return (
    <HoverCardContent side="top" align="center" className="w-80 p-4 space-y-3">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-serif font-bold text-base text-[var(--color-walnut)] truncate">
            {resume.title}
          </h4>
          {resume.version && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-muted)] font-mono shrink-0">
              {resume.version}
            </span>
          )}
        </div>
        {resume.headline && (
          <p className="text-xs font-medium text-[var(--color-muted)] line-clamp-1">
            {resume.headline}
          </p>
        )}
      </div>

      {/* Summary */}
      {resume.summary && (
        <p className="text-xs text-[var(--color-ink)] line-clamp-3 leading-relaxed border-t border-[var(--color-border)]/50 pt-2">
          {resume.summary}
        </p>
      )}

      {/* Top Skills */}
      {resume.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {resume.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-paper)] text-[var(--color-walnut)] border border-[var(--color-border)] font-medium"
            >
              {skill}
            </span>
          ))}
          {resume.skills.length > 5 && (
            <span className="text-[10px] text-[var(--color-muted)] self-center">
              +{resume.skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Tailored For */}
      {resume.tailoredFor && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
          <Tag className="w-3.5 h-3.5 text-[var(--color-walnut)]" />
          <span className="truncate">Tailored for: <strong className="text-[var(--color-ink)]">{resume.tailoredFor}</strong></span>
        </div>
      )}

      {/* Meta stats footer */}
      <div className="flex items-center justify-between text-[11px] text-[var(--color-muted)] border-t border-[var(--color-border)]/50 pt-2">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{updatedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5">
            <HardDrive className="w-3 h-3" />
            {sizeKb} KB
          </span>
          <span className="flex items-center gap-0.5 font-medium text-[var(--color-walnut)]">
            <Download className="w-3 h-3" />
            {resume.downloadCount}
          </span>
        </div>
      </div>
    </HoverCardContent>
  )
}

