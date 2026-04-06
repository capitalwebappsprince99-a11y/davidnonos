import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

export type UploadCategory = 'videos' | 'photos' | 'bio' | 'directors-bg'

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

const MAX_VIDEO_SIZE = 500 * 1024 * 1024  // 500 MB
const MAX_IMAGE_SIZE = 20 * 1024 * 1024   // 20 MB

// Files are stored under data/uploads/ — same volume as the DB on Railway
function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), 'data', 'uploads')
}

export interface UploadedFile {
  fileName: string
  filePath: string   // URL path, served via /api/files/...
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
  const uploadDir = path.join(getUploadsDir(), category)

  await fs.mkdir(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, fileName)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filePath, buffer)

  return {
    fileName,
    filePath: `/api/files/${category}/${fileName}`,
    mimeType,
    size,
  }
}

export async function deleteFile(urlPath: string): Promise<void> {
  if (!urlPath.startsWith('/api/files/')) return
  // Strip /api/files/ prefix to get category/filename
  const relative = urlPath.replace(/^\/api\/files\//, '')
  const absPath = path.join(getUploadsDir(), relative)
  try {
    await fs.unlink(absPath)
  } catch {
    // File may already be gone — ignore
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
