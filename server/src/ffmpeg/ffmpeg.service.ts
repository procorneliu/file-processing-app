import { Injectable, MessageEvent } from '@nestjs/common';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import AdmZip from 'adm-zip';
import { Observable, ReplaySubject } from 'rxjs';
import processors from './fileProcessors/processors';
import { archiveFramesDirectory } from './helpers/archiver';
import cleanUp from './helpers/cleanUp';
import {
  buildOutputName,
  createFramesOutputDirectory,
  createTempOutputPath,
  determineOutput,
  writeTempInput,
} from './helpers/outputNamer';
import { buildCommand } from './helpers/commandsManager';
import { ProgressStreamManager } from './helpers/progressManager';

type HandlePromiseReturn = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

@Injectable()
export class FfmpegService {
  // private readonly progressStreams = new Map<
  //   string,
  //   ReplaySubject<MessageEvent>
  // >();

  private readonly activeJobs = new Map<string, ffmpeg.FfmpegCommand>();
  private readonly cancelledJobs = new Set<string>();

  constructor() {
    if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic);
  }

  async handle(
    file: Express.Multer.File,
    type: string,
    jobId?: string,
  ): Promise<HandlePromiseReturn | null> {
    const manager = new ProgressStreamManager();

    const { extension, mimeType } = determineOutput(type);

    const inputPath = await writeTempInput(file);
    const cleanupTargets: string[] = [inputPath];

    if (jobId) {
      manager.initProgress(jobId);
      manager.emitProgress(jobId, 0);
    }

    try {
      const isFrameExtraction = type === 'mp4_png';
      const outputTarget = isFrameExtraction
        ? await createFramesOutputDirectory()
        : createTempOutputPath(extension);

      cleanupTargets.push(outputTarget);

      const command = buildCommand(inputPath, outputTarget, type);
      if (jobId) this.activeJobs.set(jobId, command);

      await this.executeCommand(command, manager, jobId);

      if (jobId && this.cancelledJobs.has(jobId)) {
        return null;
      }

      let buffer: Buffer;
      const filename = buildOutputName(file.originalname, extension);

      if (isFrameExtraction) {
        const zipPath = createTempOutputPath(extension);
        cleanupTargets.push(zipPath);
        await archiveFramesDirectory(outputTarget, zipPath);
        buffer = await fs.readFile(zipPath);
      } else {
        buffer = await fs.readFile(outputTarget);
      }

      if (jobId) {
        manager.emitProgress(jobId, 100);
        manager.completeProgress(jobId);
      }

      console.log('Processing DONE! Output size:', buffer.length);

      return {
        buffer,
        filename,
        mimeType,
      };
    } catch (error) {
      if (jobId && this.cancelledJobs.has(jobId)) {
        return null;
      }
      if (jobId) manager.failProgress(jobId, error as Error);
      throw error;
    } finally {
      if (jobId) {
        this.activeJobs.delete(jobId);
        this.cancelledJobs.delete(jobId);
      } else {
        this.activeJobs.clear();
        this.cancelledJobs.clear();
      }
      await cleanUp(cleanupTargets);
    }
  }

  cancel(jobId: string, manager: ProgressStreamManager) {
    const command = this.activeJobs.get(jobId);
    const stream = manager.progressStreams.get(jobId);

    this.cancelledJobs.add(jobId);
    command?.kill('SIGKILL');
    if (!stream) return;
    stream.next({ type: 'cancelled', data: {} });
    stream.complete();
    manager.progressStreams.delete(jobId);
    console.log('Job processing canceled!');
  }

  // // ---- ACTIONS

  // private convertToMp3(inputPath: string, outputPath: string) {
  //   return ffmpeg(inputPath)
  //     .noVideo()
  //     .audioCodec('libmp3lame')
  //     .audioBitrate('192k')
  //     .format('mp3')
  //     .output(outputPath);
  // }

  // private extractAllPng(inputPath: string, outputPath: string) {
  //   return ffmpeg(inputPath)
  //     .noAudio()
  //     .videoCodec('png')
  //     .format('image2')
  //     .outputOptions(['-start_number', '1', '-vsync', '0'])
  //     .output(path.join(outputPath, 'frame_%05d.png'));
  // }

  // -- HELPER FUNCTIONS

  // private buildOutputName(inputName: string, extension: string) {
  //   const { name } = path.parse(inputName);
  //   return `${name || 'processed-file'}${extension}`;
  // }

  // private async writeTempInput(file: Express.Multer.File) {
  //   const extension =
  //     path.extname(file.originalname) || this.extensionFromMime(file.mimetype);
  //   const tempPath = path.join(
  //     tmpdir(),
  //     `${randomUUID()}${extension || '.tmp'}`,
  //   );
  //   await fs.writeFile(tempPath, file.buffer);
  //   return tempPath;
  // }

  // private createTempOutputPath(extension: string) {
  //   return path.join(tmpdir(), `${randomUUID()}${extension}`);
  // }

  // private async createFramesOutputDirectory() {
  //   return fs.mkdtemp(path.join(tmpdir(), `${randomUUID()}-frames-`));
  // }

  // private determineOutput(type: string) {
  //   switch (type) {
  //     case 'mp4_mp3':
  //       return { extension: '.mp3', mimeType: 'audio/mpeg' };
  //     case 'mp4_png':
  //       return { extension: '.zip', mimeType: 'application/zip' };
  //     default:
  //       throw new Error(`Unsupported process type: ${type}`);
  //   }
  // }

  // private extensionFromMime(mimetype?: string) {
  //   if (!mimetype) return '';
  //   const map: Record<string, string> = {
  //     'video/mp4': '.mp4',
  //     'video/quicktime': '.mov',
  //     'video/x-matroska': '.mkv',
  //     'video/webm': '.webm',
  //   };
  //   return map[mimetype] ?? '';
  // }

  // private buildCommand(inputPath: string, outputPath: string, type: string) {
  //   switch (type) {
  //     case 'mp4_mp3':
  //       return processors.convertToMp3(inputPath, outputPath);
  //     case 'mp4_png':
  //       return processors.extractAllPng(inputPath, outputPath);
  //     default:
  //       throw new Error(`Unsupported process type: ${type}`);
  //   }
  // }

  private executeCommand(
    command: ffmpeg.FfmpegCommand,
    manager: ProgressStreamManager,
    jobId?: string,
  ) {
    return new Promise<void>((resolve, reject) => {
      command
        .on('error', (error: Error) => {
          if (jobId && this.cancelledJobs.has(jobId)) {
            resolve();
            return;
          }
          console.log(error);
          reject(error);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`Processing: ${Math.floor(progress.percent)}% done`);
            if (jobId && progress.percent >= 0)
              manager.emitProgress(jobId, Math.floor(progress.percent));
          }
        })
        .on('end', () => resolve())
        .run();
    });
  }

  // private async archiveFramesDirectory(sourceDir: string, zipPath: string) {
  //   const zip = new AdmZip();
  //   const entries = await fs.readdir(sourceDir);

  //   entries.sort();

  //   for (const name of entries) {
  //     const entryPath = path.join(sourceDir, name);
  //     const stats = await fs.stat(entryPath);

  //     if (stats.isFile()) {
  //       zip.addLocalFile(entryPath, '', name);
  //     }
  //   }

  //   const zipBuffer = zip.toBuffer();
  //   await fs.writeFile(zipPath, zipBuffer);
  // }

  // ----------

  // getProgressStream(jobId: string): Observable<MessageEvent> {
  //   this.initProgress(jobId);
  //   const stream = this.progressStreams.get(jobId);
  //   if (!stream) throw new Error('Progress stream not initialized');
  //   return stream.asObservable();
  // }

  // private initProgress(jobId: string) {
  //   if (!this.progressStreams.has(jobId)) {
  //     this.progressStreams.set(jobId, new ReplaySubject<MessageEvent>(1));
  //   }
  // }

  // private emitProgress(jobId: string, percent: number) {
  //   const stream = this.progressStreams.get(jobId);
  //   if (!stream) return;
  //   stream.next({ type: 'progress', data: { percent } });
  // }

  // private completeProgress(jobId: string) {
  //   const stream = this.progressStreams.get(jobId);
  //   if (!stream) return;
  //   stream.next({ type: 'complete', data: { percent: 100 } });
  //   stream.complete();
  //   this.progressStreams.delete(jobId);
  // }

  // private failProgress(jobId: string, error: Error) {
  //   const stream = this.progressStreams.get(jobId);
  //   if (!stream) return;
  //   stream.next({ type: 'error', data: { message: error.message } });
  //   stream.complete();
  //   this.progressStreams.delete(jobId);
  // }

  // ----------

  // private async cleanUp(paths: string[]) {
  //   await Promise.all(
  //     paths.map(async (filePath) => {
  //       try {
  //         const stats = await fs.lstat(filePath);
  //         if (stats.isDirectory()) {
  //           await fs.rm(filePath, { recursive: true, force: true });
  //         } else {
  //           await fs.unlink(filePath);
  //         }
  //       } catch (error) {
  //         const err = error as NodeJS.ErrnoException;
  //         if (err.code !== 'ENOENT') {
  //           console.log('Failed to remove temp file', filePath, error);
  //         }
  //       }
  //     }),
  //   );
  // }
}
