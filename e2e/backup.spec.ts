import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import os from 'os'

test.describe('Backup export → import round-trip', () => {
  test('exports a backup zip then imports it back', async ({ page }) => {
    await page.goto('/')

    // Dismiss onboarding
    const startBlank = page.getByRole('button', { name: /start blank/i })
    if (await startBlank.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startBlank.click()
    }

    // Ensure a shelf exists
    const createFirstShelf = page.getByRole('button', { name: /create first shelf/i })
    if (await createFirstShelf.isVisible({ timeout: 1500 }).catch(() => false)) {
      await createFirstShelf.click()
      await page.getByLabel(/shelf name/i).fill('Backup Test Shelf')
      await page.getByRole('button', { name: /create shelf/i }).click()
    }

    // Upload a resume
    await page.getByRole('button', { name: /add resume/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rs-backup-e2e-'))
    const pdfPath = path.join(tmpDir, 'backup-resume.pdf')
    const minimalPdf =
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
      '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
      'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n' +
      '0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
    fs.writeFileSync(pdfPath, minimalPdf)

    await page.locator('input[type="file"]').first().setInputFiles(pdfPath)
    await page.getByLabel(/title/i).fill('Backup Test Resume')
    await page.getByRole('button', { name: /add to shelf/i }).click()
    await expect(page.getByText(/added.*to shelf/i)).toBeVisible({ timeout: 5000 })

    // Open backup menu
    await page.getByRole('button', { name: /backup/i }).click()
    const backupDialog = page.getByRole('dialog').filter({ hasText: /backup.*restore/i })
    await expect(backupDialog).toBeVisible()

    // Export
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 })
    await backupDialog.getByRole('button', { name: /export backup/i }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/resume-shelf-backup.*\.zip/)

    // Save the downloaded file
    const zipPath = path.join(tmpDir, 'backup.zip')
    await download.saveAs(zipPath)
    expect(fs.existsSync(zipPath)).toBe(true)

    // Close export dialog
    await backupDialog.getByRole('button', { name: /close/i }).click()

    // Re-open backup menu and import
    await page.getByRole('button', { name: /backup/i }).click()
    const importDialog = page.getByRole('dialog').filter({ hasText: /backup.*restore/i })
    await expect(importDialog).toBeVisible()

    const importFileInput = importDialog.locator('input[type="file"][accept=".zip"]')
    await importFileInput.setInputFiles(zipPath)

    // Should show success toast
    await expect(page.getByText(/imported.*resume/i)).toBeVisible({ timeout: 8000 })

    fs.rmSync(tmpDir, { recursive: true })
  })
})
