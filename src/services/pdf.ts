import { suggestSkillsFromText } from '@/domain/skills'

export interface PdfExtractionResult {
  text: string
  pageCount: number
  suggestedSkills: string[]
}

/**
 * Lazily loads pdfjs-dist and extracts text & page count from a PDF Blob
 */
export async function extractPdfMetadata(blob: Blob): Promise<PdfExtractionResult> {
  const arrayBuffer = await blob.arrayBuffer()

  // Dynamic import of pdfjs-dist per specification
  const pdfjs = await import('pdfjs-dist')

  // Set worker source if not configured
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
  }

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) })
  const pdf = await loadingTask.promise
  const pageCount = pdf.numPages

  let fullText = ''

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
      fullText += `${pageText}\n`
    } catch (pageErr) {
      console.warn(`Could not extract text from page ${pageNum.toString()}:`, pageErr)
    }
  }

  const cleanText = fullText.trim()
  const suggestedSkills = suggestSkillsFromText(cleanText)

  return {
    text: cleanText,
    pageCount,
    suggestedSkills,
  }
}

/**
 * Renders the first page of a PDF blob to a Canvas element
 */
export async function renderFirstPageToCanvas(
  blob: Blob,
  canvas: HTMLCanvasElement,
  scale = 1.0
): Promise<void> {
  const arrayBuffer = await blob.arrayBuffer()
  const pdfjs = await import('pdfjs-dist')

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
  }

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) })
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)

  const viewport = page.getViewport({ scale })
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas 2D context not available')
  }

  canvas.height = viewport.height
  canvas.width = viewport.width

  await page.render({
    canvasContext: context,
    canvas,
    viewport,
  }).promise
}
