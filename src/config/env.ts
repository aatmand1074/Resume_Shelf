import { z } from 'zod'

/**
 * Validated Environment and Runtime Configuration
 * Reads from Vite's typed import.meta.env with safe defaults.
 */
const envSchema = z.object({
  APP_NAME: z.string().default('Resume Shelf'),
  APP_VERSION: z.string().default('1.0.0'),
  DEFAULT_STORAGE_NAME: z.string().default('ResumeShelfDB'),
  BACKUP_REMINDER_DAYS: z.coerce.number().positive().default(14),
  MAX_FILE_SIZE_BYTES: z.coerce.number().positive().default(10 * 1024 * 1024), // 10MB
  IS_PRODUCTION: z.boolean(),
  IS_DEVELOPMENT: z.boolean(),
})

const parsedEnv = envSchema.safeParse({
  APP_NAME: import.meta.env.VITE_APP_NAME,
  APP_VERSION: import.meta.env.VITE_APP_VERSION,
  DEFAULT_STORAGE_NAME: import.meta.env.VITE_STORAGE_DB_NAME,
  BACKUP_REMINDER_DAYS: import.meta.env.VITE_BACKUP_REMINDER_DAYS,
  MAX_FILE_SIZE_BYTES: import.meta.env.VITE_MAX_FILE_SIZE_BYTES,
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
})

if (!parsedEnv.success) {
  console.warn('Configuration validation warning, using default configuration values:', parsedEnv.error.issues)
}

export const appConfig = parsedEnv.success
  ? parsedEnv.data
  : envSchema.parse({
      IS_PRODUCTION: import.meta.env.PROD,
      IS_DEVELOPMENT: import.meta.env.DEV,
    })
