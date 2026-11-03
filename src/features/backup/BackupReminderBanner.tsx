import React from 'react'
import { AlertCircle, X } from 'lucide-react'
import { useMeta } from '@/storage/hooks'

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000

interface BackupReminderBannerProps {
  onOpenBackup: () => void
}

export const BackupReminderBanner: React.FC<BackupReminderBannerProps> = ({ onOpenBackup }) => {
  const lastBackupAt = useMeta('lastBackupAt') as number | undefined
  const [dismissed, setDismissed] = React.useState(false)

  const shouldShow =
    !dismissed &&
    (lastBackupAt === undefined || Date.now() - lastBackupAt > FOURTEEN_DAYS_MS)

  if (!shouldShow) return null

  return (
    <div
      role="alert"
      className="flex items-center gap-3 px-4 sm:px-8 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs"
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
      <span className="flex-1">
        {lastBackupAt === undefined
          ? "You haven't backed up your library yet."
          : 'Your last backup was more than 14 days ago.'}{' '}
        <button
          type="button"
          onClick={onOpenBackup}
          className="underline font-semibold hover:text-amber-900 cursor-pointer"
        >
          Back up now
        </button>
      </span>
      <button
        type="button"
        onClick={() => {
          setDismissed(true)
        }}
        aria-label="Dismiss backup reminder"
        className="ml-auto opacity-60 hover:opacity-100 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
