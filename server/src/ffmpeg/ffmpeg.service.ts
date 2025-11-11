import { Injectable, Logger } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { promises as fs } from 'fs';
import { ReplaySubject } from 'rxjs';
import { FfmpegCommand } from 'fluent-ffmpeg';
import mime from 'mime-types';

import { archiveFramesDirectory } from './helpers/archiver';
import cleanUp from './helpers/cleanUp';
import {
  buildOutputName,
  createTempOutputPath,
  getDynamicOutput,
  writeTempInput,
} from './helpers/outputNamer';
import { buildCommand } from './helpers/commandsManager';
import {
  ProgressMessage,
  ProgressStreamManager,
} from './helpers/progressManager';

type HandlePromiseReturn = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

type JobRecord = {
  command: FfmpegCommand;
  cleanupTargets: string[];
  cancelled: boolean;
  type?: string;
  options?: string;
};

@Injectable()
export class FfmpegService {
  private readonly logger = new Logger(FfmpegService.name);

  private readonly progressStreams = new Map<
    string,
    ReplaySubject<ProgressMessage>
  >();
  private readonly manager: ProgressStreamManager;

  private readonly jobs = new Map<string, JobRecord>();

  constructor(@InjectQueue('processing') private processingQueue: Queue) {
    this.manager = new ProgressStreamManager(this.progressStreams);
  }

  logProgress(percent: number) {
    this.logger.log(`Processing: ${Math.floor(percent)}% done`);
  }

  async handle(
    file: Express.Multer.File,
    type: string,
    convertTo: string,
    options: string,
    jobId: string,
  ): Promise<HandlePromiseReturn | null> {
    const inputPath = await writeTempInput(file);
    const cleanupTargets: string[] = [inputPath];

    if (jobId) this.initProgress(jobId);

    try {
      const { outputTarget, isFrameExtraction } = await getDynamicOutput(
        type,
        convertTo,
      );
      cleanupTargets.push(outputTarget);

      const mimeType = isFrameExtraction
        ? 'application/zip'
        : mime.lookup(convertTo) || 'application/octet-stream';

      const progressCallback = jobId
        ? (percent: number) => {
            this.logProgress(percent);
            this.manager.emitProgress(jobId, percent);
          }
        : undefined;

      const { command, cleanupTargets: additionalCleanupTargets } =
        await buildCommand(
          inputPath,
          outputTarget,
          type,
          options,
          convertTo,
          progressCallback,
        );
      if (additionalCleanupTargets)
        cleanupTargets.push(...additionalCleanupTargets);

      if (jobId)
        this.jobs.set(jobId, {
          command,
          cleanupTargets,
          cancelled: false,
          type,
          options,
        });

      await this.executeCommand(command, jobId);

      if (jobId && this.jobs.get(jobId)?.cancelled) {
        return null;
      }

      // For video_image, use .zip extension for the filename
      const outputExtension = type === 'video_image' ? 'zip' : convertTo;
      const filename = buildOutputName(file.originalname, outputExtension);
      const buffer = await this.readResult(
        outputTarget,
        isFrameExtraction,
        convertTo,
        cleanupTargets,
      );

      if (jobId) this.completeProgress(jobId);

      this.logger.log('Processing DONE! Output size:', buffer.length);

      return { buffer, filename, mimeType };
    } catch (err) {
      if (jobId && this.jobs.get(jobId)?.cancelled) {
        return null;
      }
      if (jobId) this.manager.failProgress(jobId, err as Error);
      throw err;
    } finally {
      await this.finalizeJob(jobId, cleanupTargets);
    }
  }

  getProgressStream(jobId: string) {
    return this.manager.getProgressStream(jobId);
  }

  cancel(jobId: string) {
    const job = this.jobs.get(jobId);
    const stream = this.progressStreams.get(jobId);

    if (!job) {
      if (stream) {
        stream.next({ type: 'cancelled', data: {} });
        stream.complete();
        this.progressStreams.delete(jobId);
      }
      return;
    }

    job.cancelled = true;
    job.command.kill('SIGKILL');

    if (stream) {
      stream.next({ type: 'cancelled', data: {} });
      stream.complete();
      this.progressStreams.delete(jobId);
    }

    this.logger.log(`Job ${jobId} canceled!`);
  }

  // ---- PRIVATE HELPER FUNCTIONS ----

  private async readResult(
    outputTarget: string,
    isFrameExtraction: boolean,
    convertTo: string,
    cleanupTargets: string[],
  ): Promise<Buffer> {
    if (!isFrameExtraction) {
      return fs.readFile(outputTarget);
    }

    const zipPath = createTempOutputPath('zip');
    cleanupTargets.push(zipPath);

    await archiveFramesDirectory(outputTarget, zipPath);
    return fs.readFile(zipPath);
  }

  private initProgress(jobId: string) {
    this.manager.initProgress(jobId);
    this.manager.emitProgress(jobId, 0);
  }

  private completeProgress(jobId: string) {
    this.manager.emitProgress(jobId, 100);
    this.manager.completeProgress(jobId);
  }

  private clearJobById(jobId: string) {
    this.jobs.delete(jobId);
    this.progressStreams.delete(jobId);
  }

  private clearAllJobs() {
    this.jobs.clear();
    this.progressStreams.clear();
  }

  private async finalizeJob(
    jobId: string | undefined,
    cleanupTargets: string[],
  ) {
    if (jobId) {
      this.clearJobById(jobId);
    } else {
      this.clearAllJobs();
    }
    await cleanUp(cleanupTargets);
  }

  private executeCommand(command: FfmpegCommand, jobId?: string) {
    return new Promise<void>((resolve, reject) => {
      command
        .on('error', (error: Error) => {
          if (jobId && this.jobs.get(jobId)?.cancelled) {
            resolve();
            return;
          }
          console.log(error);
          reject(error);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            this.logProgress(progress.percent);
            if (jobId && progress.percent >= 0) {
              const job = this.jobs.get(jobId);

              const isVideoImage = job?.type === 'video_image';
              let needsToSteps = false;
              if (isVideoImage && job.options) {
                try {
                  const parsedOptions = JSON.parse(job.options);
                  needsToSteps = !!(
                    parsedOptions.fps || parsedOptions.resolution
                  );
                } catch {
                  /* empty */
                }
              }
              let finalPercent = Math.floor(progress.percent);
              if (needsToSteps) {
                finalPercent = 50 + Math.floor(progress.percent / 2);
              }

              this.manager.emitProgress(jobId, finalPercent);
            }
          }
        })
        .on('end', () => resolve())
        .run();
    });
  }
}
