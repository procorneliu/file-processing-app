import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import path from 'path';

export async function getDynamicOutput(type: string, extension: string) {
  const isFrameExtraction = type === 'video_image';
  const outputTarget = isFrameExtraction
    ? await createFramesOutputDirectory()
    : createTempOutputPath(extension);

  return { outputTarget, isFrameExtraction };
}

// MODEL PROCESSED FILE NAME BY INPUT FILE
export function buildOutputName(inputName: string, extension: string) {
  const { name } = path.parse(inputName);
  return `${name || 'processed-file'}.${extension}`;
}

// WRITE TEMPORARY INPUT PATH ON LOCAL MACHINE
export async function writeTempInput(file: Express.Multer.File) {
  const extension =
    path.extname(file.originalname) || extensionFromMime(file.mimetype);
  const tempPath = path.join(tmpdir(), `${randomUUID()}${extension || '.tmp'}`);

  // If file was saved to disk (diskStorage), use file.path
  // Otherwise, use file.buffer (memoryStorage)
  if (file.path) {
    await fs.copyFile(file.path, tempPath);
  } else if (file.buffer) {
    await fs.writeFile(tempPath, file.buffer);
  } else {
    throw new Error('File has neither path nor buffer');
  }

  return tempPath;
}

// WRITE TEMPORARY OUTPUT PATH ON LOCAL MACHINE
export function createTempOutputPath(extension: string) {
  return path.join(tmpdir(), `${randomUUID()}.${extension}`);
}

// WRITE TEMPORARY OUTPUT DIRECTORY ON LOCAL MACHINE
export async function createFramesOutputDirectory() {
  return fs.mkdtemp(path.join(tmpdir(), `${randomUUID()}-frames-`));
}

// DEPENDING ON INPUT FILE OUTPUT WILL BE FILE OR FOLDER
export function determineOutput(type: string) {
  switch (type) {
    case 'video_audio':
      return { extension: '.mp3', mimeType: 'audio/mpeg' };
    case 'video_image':
      return { extension: '.zip', mimeType: 'application/zip' };
    default:
      throw new Error(`Unsupported process type: ${type}`);
  }
}

// FILE EXTENSION FROM MIME DATA SEND TO HTTP
export function extensionFromMime(mimetype?: string) {
  if (!mimetype) return '';
  const map: Record<string, string> = {
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/x-matroska': '.mkv',
    'video/webm': '.webm',
  };
  return map[mimetype] ?? '';
}
