import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import os from 'os'

test.describe('Upload → Hover card → Download', () => {
  test('uploads a PDF, shows hover card with metadata, quick-downloads it', async ({ page }) => {
    await page.goto('/')

    // Dismiss onboarding if it appears
    const startBlank = page.getByRole('button', { name: /start blank/i })
    if (await startBlank.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startBlank.click()
    }

    // Create a shelf first if none exist
    const createFirstShelf = page.getByRole('button', { name: /create first shelf/i })
    if (await createFirstShelf.isVisible({ timeout: 1500 }).catch(() => false)) {
      await createFirstShelf.click()
      await page.getByLabel(/shelf name/i).fill('Test Shelf')
      await page.getByRole('button', { name: /create shelf/i }).click()
    }

    // Open upload dialog
    await page.getByRole('button', { name: /add resume/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Create a minimal PDF blob for upload
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rs-e2e-'))
    const pdfPath = path.join(tmpDir, 'test-resume.pdf')
    // Minimal valid PDF bytes
    const minimalPdf =
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
      '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
      'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n' +
      '0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
    fs.writeFileSync(pdfPath, minimalPdf)

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(pdfPath)

    // Fill required fields
    await page.getByLabel(/title/i).fill('Senior Engineer Resume')

    // Save
    await page.getByRole('button', { name: /add to shelf/i }).click()

    // Verify toast
    await expect(page.getByText(/added.*to shelf/i)).toBeVisible({ timeout: 5000 })

    // Hover over the book spine to see hover card
    const book = page.locator('[data-testid="book-spine"]').first()
    if (await book.isVisible({ timeout: 3000 }).catch(() => false)) {
      await book.hover()
      await expect(page.getByText('Senior Engineer Resume')).toBeVisible({ timeout: 3000 })
    }

    // Quick-download: shift+click or the download button
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 })
    await book.click({ modifiers: ['Shift'] })
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.pdf')

    fs.rmSync(tmpDir, { recursive: true })
  })
})
