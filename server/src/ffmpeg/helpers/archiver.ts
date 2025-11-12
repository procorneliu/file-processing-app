import archiver from 'archiver';
import fs from 'fs';

export async function archiveFramesDirectory(
  sourceDir: string,
  zipPath: string,
): Promise<void> {
  // create a file to stream archive data to.
  const output = fs.createWriteStream(zipPath, { highWaterMark: 1024 * 1024 });
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level
  });

  const done = new Promise<void>((resolve, reject) => {
    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));
  });

  archive.pipe(output);
  archive.directory(sourceDir, false);

  await archive.finalize();
  await done;
}
