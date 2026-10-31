export interface FilenameTokens {
  name?: string
  shelf?: string
  version?: string
  title?: string
  date?: string
}

export function sanitizeFilenamePart(input: string): string {
  // Allow letters, numbers, dots, dashes, underscores; replace spaces/invalid with underscore
  return input
    .trim()
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function generateDownloadFilename(
  template: string,
  tokens: FilenameTokens,
  originalFileName: string
): string {
  const extMatch = originalFileName.match(/\.[^.]+$/)
  const extension = extMatch ? extMatch[0] : '.pdf'

  const now = new Date()
  const year = now.getFullYear().toString()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const dateFormatted = `${year}-${month}-${day}`

  const values: Record<string, string> = {
    name: sanitizeFilenamePart(tokens.name || 'Resume'),
    shelf: sanitizeFilenamePart(tokens.shelf || 'General'),
    version: sanitizeFilenamePart(tokens.version || 'v1'),
    title: sanitizeFilenamePart(tokens.title || 'Resume'),
    date: dateFormatted,
  }

  let result = template
  for (const [key, val] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val)
  }

  // Remove any remaining unresolved tokens like {unknown}
  result = result.replace(/\{[^}]+\}/g, '')
  result = sanitizeFilenamePart(result)

  if (!result) {
    result = 'Resume'
  }

  return `${result}${extension}`
}
