import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import path from 'path';

// MODEL PROCESSED FILE NAME BY INPUT FILE
export function buildOutputName(inputName: string, extension: string) {
  const { name } = path.parse(inputName);
  return `${name || 'processed-file'}${extension}`;
}

// WRITE TEMPORARY INPUT PATH ON LOCAL MACHINE
export async function writeTempInput(file: Express.Multer.File) {
  const extension =
    path.extname(file.originalname) || this.extensionFromMime(file.mimetype);
  const tempPath = path.join(tmpdir(), `${randomUUID()}${extension || '.tmp'}`);
  await fs.writeFile(tempPath, file.buffer);
  return tempPath;
}

// WRITE TEMPORARY OUTPUT PATH ON LOCAL MACHINE
export function createTempOutputPath(extension: string) {
  return path.join(tmpdir(), `${randomUUID()}${extension}`);
}

// WRITE TEMPORARY OUTPUT DIRECTORY ON LOCAL MACHINE
export async function createFramesOutputDirectory() {
  return fs.mkdtemp(path.join(tmpdir(), `${randomUUID()}-frames-`));
}

// DEPENDING ON INPUT FILE OUTPUT WILL BE FILE OR FOLDER
export function determineOutput(type: string) {
  switch (type) {
    case 'mp4_mp3':
      return { extension: '.mp3', mimeType: 'audio/mpeg' };
    case 'mp4_png':
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
