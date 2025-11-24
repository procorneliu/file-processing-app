import {
  BadRequestException,
  Controller,
  HttpException,
  HttpStatus,
  MessageEvent,
  Param,
  Post,
  Req,
  Sse,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import path from 'path';
import { Observable } from 'rxjs';
import { FfmpegService } from './ffmpeg.service';
import { AuthService } from '../auth/auth.service';
import { SubscriptionService } from '../subscription/subscription.service';
import processors from './fileProcessors/processors';

@Controller('process')
export class FfmpegController {
  constructor(
    private ffmpegService: FfmpegService,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: function (req, file, cb) {
          const outDir = path.join(__dirname, 'uploads');
          try {
            mkdirSync(outDir, { recursive: true });
            cb(null, outDir);
          } catch (error) {
            cb(error as Error, '');
          }
        },
        filename: function (req, file, cb) {
          cb(null, file.originalname);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024 * 1024, // 10GB limit (for Pro users)
      },
    }),
  )
  async processFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<StreamableFile | { url: string; filename: string }> {
    if (!file) throw new BadRequestException('File upload is required');
    const { type, convertTo, jobId, generateDownloadLink, options } = req.body;
    if (!jobId) throw new BadRequestException('JobId is required');

    // Get user subscription status
    const accessToken = req.cookies?.access_token;
    let isPro = false;
    if (accessToken) {
      const user = await this.authService.getCurrentUser(accessToken);
      if (user) {
        const subscriptionStatus =
          await this.subscriptionService.getSubscriptionStatus(user.id);
        isPro = subscriptionStatus === 'pro';
      }
    }

    // Validate file size
    const maxFileSizeBytes = isPro
      ? 10 * 1024 * 1024 * 1024 // 10GB
      : 1 * 1024 * 1024 * 1024; // 1GB

    if (file.size > maxFileSizeBytes) {
      const maxSizeGB = isPro ? '10GB' : '1GB';
      throw new BadRequestException(
        `File size exceeds the limit. Maximum file size for ${isPro ? 'Pro' : 'Free'} plan is ${maxSizeGB}.`,
      );
    }

    // Validate video duration for video files
    // Note: File is saved by multer to file.path when using diskStorage
    const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv'];
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (fileExtension && videoFormats.includes(fileExtension) && file.path) {
      try {
        const duration = await processors.getFileDurationInSeconds(file.path);
        if (duration !== null) {
          const maxDurationSeconds = isPro ? 60 * 60 : 5 * 60; // 60 min pro, 5 min free
          const maxDurationMinutes = isPro ? 60 : 5;

          if (duration > maxDurationSeconds) {
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            throw new BadRequestException(
              `Video length exceeds the limit. Maximum video length for ${isPro ? 'Pro' : 'Free'} plan is ${maxDurationMinutes} minutes. Your video is ${minutes}m ${seconds}s.`,
            );
          }
        }
      } catch (error) {
        // If error is BadRequestException (our validation error), rethrow it
        if (error instanceof BadRequestException) {
          throw error;
        }
        // Otherwise, continue processing (duration check failed but not critical)
      }
    }

    const generateLink = generateDownloadLink === 'true';

    const result = await this.ffmpegService.handle(
      file,
      type,
      convertTo,
      options,
      generateLink,
      jobId,
    );

    if (!result) {
      throw new HttpException('', HttpStatus.NO_CONTENT);
    }

    const { buffer, filename, mimeType, length, downloadUrl } = result;

    if (generateLink && downloadUrl) {
      return {
        url: downloadUrl,
        filename,
      };
    }

    // StreamableFile accepts both Buffer and Readable, but TypeScript needs explicit handling
    if (Buffer.isBuffer(buffer)) {
      return new StreamableFile(buffer, {
        type: mimeType,
        disposition: `attachment; filename="${encodeURIComponent(filename)}"`,
        length: buffer.length,
      });
    } else {
      return new StreamableFile(buffer, {
        type: mimeType,
        disposition: `attachment; filename="${encodeURIComponent(filename)}"`,
        length: length,
      });
    }
  }

  @Post('cancel/:id')
  cancelProcessFile(@Param('id') jobId: string) {
    if (!jobId) throw new BadRequestException('JobId is required');
    this.ffmpegService.cancel(jobId);
  }

  @Sse('progress/:id')
  progress(@Param('id') jobId: string): Observable<MessageEvent> {
    if (!jobId) throw new BadRequestException('JobId is required');
    return this.ffmpegService.getProgressStream(jobId);
  }
}
