/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_STORAGE_DB_NAME?: string
  readonly VITE_BACKUP_REMINDER_DAYS?: string
  readonly VITE_MAX_FILE_SIZE_BYTES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
