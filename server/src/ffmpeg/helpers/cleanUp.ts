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
      } catch {
        // Silently ignore cleanup errors (file may not exist or already deleted)
      }
    }),
  );
}

export default cleanUp;
