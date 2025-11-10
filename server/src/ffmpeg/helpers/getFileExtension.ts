import path from 'path';

export default function getFileExtension(inputPath: string) {
  return path.extname(inputPath).replace('.', '').toLowerCase();
}
