import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import os from 'os'

test.describe('Text search via Command Palette', () => {
  test('finds an uploaded resume by title using the search palette', async ({ page }) => {
    await page.goto('/')

    // Dismiss onboarding
    const startBlank = page.getByRole('button', { name: /start blank/i })
    if (await startBlank.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startBlank.click()
    }

    // Ensure at least one shelf exists
    const createFirstShelf = page.getByRole('button', { name: /create first shelf/i })
    if (await createFirstShelf.isVisible({ timeout: 1500 }).catch(() => false)) {
      await createFirstShelf.click()
      await page.getByLabel(/shelf name/i).fill('ML Engineer')
      await page.getByRole('button', { name: /create shelf/i }).click()
    }

    // Upload a resume
    await page.getByRole('button', { name: /add resume/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rs-search-e2e-'))
    const pdfPath = path.join(tmpDir, 'search-test.pdf')
    const minimalPdf =
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
      '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
      'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n' +
      '0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
    fs.writeFileSync(pdfPath, minimalPdf)

    await page.locator('input[type="file"]').first().setInputFiles(pdfPath)
    await page.getByLabel(/title/i).fill('XGBoost Specialist')
    await page.getByRole('button', { name: /add to shelf/i }).click()
    await expect(page.getByText(/added.*to shelf/i)).toBeVisible({ timeout: 5000 })

    // Open command palette
    await page.keyboard.press('/')
    const palette = page.getByRole('dialog').filter({ hasText: /search/i })
    await expect(palette).toBeVisible({ timeout: 3000 })

    // Type to search
    await page.keyboard.type('XGBoost')
    await expect(palette.getByText('XGBoost Specialist')).toBeVisible({ timeout: 3000 })

    // Click result to open drawer
    await palette.getByText('XGBoost Specialist').click()
    await expect(page.getByRole('dialog').filter({ hasText: 'XGBoost Specialist' })).toBeVisible({
      timeout: 3000,
    })

    fs.rmSync(tmpDir, { recursive: true })
  })
})
