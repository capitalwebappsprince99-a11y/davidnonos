import { put, del } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

export type UploadCategory = 'videos' | 'photos' | 'bio' | 'directors-bg'

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

const MAX_VIDEO_SIZE = 500 * 1024 * 1024  // 500 MB
const MAX_IMAGE_SIZE = 20 * 1024 * 1024   // 20 MB

export interface UploadedFile {
  fileName: string
  filePath: string   // public Vercel Blob URL
  mimeType: string
  size: number
}

export async function saveUploadedFile(
  file: File,
  category: UploadCategory
): Promise<UploadedFile> {
  const mimeType = file.type
  const size = file.size

  if (category === 'videos' || category === 'directors-bg') {
    if (!ALLOWED_VIDEO_TYPES.includes(mimeType)) {
      throw new Error(`Type non autorisé. Vidéo acceptée: ${ALLOWED_VIDEO_TYPES.join(', ')}`)
    }
    if (size > MAX_VIDEO_SIZE) {
      throw new Error('Fichier trop volumineux. Maximum 500 MB pour les vidéos.')
    }
  } else {
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      throw new Error(`Type non autorisé. Image acceptée: ${ALLOWED_IMAGE_TYPES.join(', ')}`)
    }
    if (size > MAX_IMAGE_SIZE) {
      throw new Error('Fichier trop volumineux. Maximum 20 MB pour les images.')
    }
  }

  const ext = path.extname(file.name) || mimeTypeToExt(mimeType)
  const fileName = `${uuidv4()}${ext}`
  const blobPath = `${category}/${fileName}`

  const blob = await put(blobPath, file, { access: 'public' })

  return {
    fileName,
    filePath: blob.url,
    mimeType,
    size,
  }
}

export async function deleteFile(url: string): Promise<void> {
  if (!url || !url.startsWith('https://')) return
  try {
    await del(url)
  } catch {
    // Already gone — ignore
  }
}

function mimeTypeToExt(mimeType: string): string {
  const map: Record<string, string> = {
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogv',
    'video/quicktime': '.mov',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
  }
  return map[mimeType] ?? ''
}
