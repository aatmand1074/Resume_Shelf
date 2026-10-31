export const LIMITS = {
  HEADLINE_MAX: 80,
  SUMMARY_MAX: 280,
  SKILLS_MAX: 12,
  SKILL_LENGTH_MAX: 30,
  FILE_SIZE_MAX: 10 * 1024 * 1024, // 10 MB
  ACCEPTED_MIME: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ACCEPTED_EXTENSIONS: ['.pdf', '.docx'],
  BACKUP_REMINDER_DAYS: 14,
} as const
