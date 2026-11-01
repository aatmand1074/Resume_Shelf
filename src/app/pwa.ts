import { registerSW } from 'virtual:pwa-register'

/**
 * Registers the service worker with automatic update checks
 */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && !window.location.host.startsWith('localhost')) {
    registerSW({
      onNeedRefresh() {
        console.info('A new version of Resume Shelf is available.')
      },
      onOfflineReady() {
        console.info('Resume Shelf is cached and ready to work offline.')
      },
    })
  }
}
