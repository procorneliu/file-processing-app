import AdmZip from 'adm-zip';
import { promises as fs } from 'fs';
import path from 'path';

export async function archiveFramesDirectory(
  sourceDir: string,
  zipPath: string,
) {
  const zip = new AdmZip();
  const entries = await fs.readdir(sourceDir);

  entries.sort();

  for (const name of entries) {
    const entryPath = path.join(sourceDir, name);
    const stats = await fs.stat(entryPath);

    if (stats.isFile()) {
      zip.addLocalFile(entryPath, '', name);
    }
  }

  const zipBuffer = zip.toBuffer();
  await fs.writeFile(zipPath, zipBuffer);
}
