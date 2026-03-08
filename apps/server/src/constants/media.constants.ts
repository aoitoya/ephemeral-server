export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]
