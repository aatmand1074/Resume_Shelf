import React from 'react'
import type { Resume } from '@/domain/types'
import { HoverCardContent } from '@/components/ui/HoverCard'
import { Download, Calendar, HardDrive, Tag, Sparkles, Building2 } from 'lucide-react'

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
  const hasSkills = resume.skills.length > 0

  return (
    <HoverCardContent
      side="top"
      align="center"
      className="w-84 p-0 overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] rounded-[var(--radius-xl)] rs-scale-in"
    >
      {/* Accent top bar */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${resume.spineColor} 0%, var(--color-accent) 100%)`,
        }}
      />

      <div className="p-4 space-y-3">
        {/* Title + version */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-serif font-bold text-base text-[var(--color-walnut)] truncate">
              {resume.title}
            </h4>
            {resume.version && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 font-mono shrink-0">
                {resume.version}
              </span>
            )}
          </div>

          {resume.headline ? (
            <p className="text-xs font-medium text-[var(--color-muted)] line-clamp-1">
              {resume.headline}
            </p>
          ) : resume.tailoredFor ? (
            <div className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
              <Building2 className="w-3 h-3 text-[var(--color-accent)]" />
              <span className="truncate">
                Tailored for:{' '}
                <strong className="text-[var(--color-ink)]">{resume.tailoredFor}</strong>
              </span>
            </div>
          ) : null}
        </div>

        {/* Skills */}
        <div className="border-t border-[var(--color-border)]/60 pt-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--color-muted)] flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[var(--color-accent)]" />
              Skills
            </span>
            {hasSkills && (
              <span className="text-[10px] text-[var(--color-muted)] font-mono">
                {resume.skills.length} tagged
              </span>
            )}
          </div>

          {hasSkills ? (
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.slice(0, 6).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-raised)] text-[var(--color-walnut)] border border-[var(--color-border)] font-medium"
                >
                  {skill}
                </span>
              ))}
              {resume.skills.length > 6 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/20 font-medium self-center">
                  +{resume.skills.length - 6} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-[var(--color-muted)] italic">
              No skills tagged yet.
            </p>
          )}
        </div>

        {/* Summary */}
        {resume.summary && (
          <p className="text-xs text-[var(--color-ink)] line-clamp-2 leading-relaxed border-t border-[var(--color-border)]/40 pt-2">
            {resume.summary}
          </p>
        )}

        {/* Tailored for */}
        {resume.headline && resume.tailoredFor && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] pt-0.5">
            <Tag className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span className="truncate">
              Tailored for:{' '}
              <strong className="text-[var(--color-ink)]">{resume.tailoredFor}</strong>
            </span>
          </div>
        )}

        {/* Meta footer */}
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
            <span className="flex items-center gap-0.5 font-semibold text-[var(--color-accent)]">
              <Download className="w-3 h-3" />
              {resume.downloadCount}
            </span>
          </div>
        </div>
      </div>
    </HoverCardContent>
  )
}
