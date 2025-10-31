import { promises as fs } from 'fs';

async function cleanUp(paths: string[]) {
  await Promise.all(
    paths.map(async (filePath) => {
      try {
        const stats = await fs.lstat(filePath);
        if (stats.isDirectory()) {
          await fs.rm(filePath, { recursive: true, force: true });
        } else {
          await fs.unlink(filePath);
        }
      } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err.code !== 'ENOENT') {
          console.log('Failed to remove temp file', filePath, error);
        }
      }
    }),
  );
}

export default cleanUp;
