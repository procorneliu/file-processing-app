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
  UseGuards,
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
import { randomUUID } from 'crypto';
import { allowedMimeTypes } from './ffmpeg.constants';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('process')
export class FfmpegController {
  constructor(
    private ffmpegService: FfmpegService,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
  ) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 900 } }) // 15 minutes - 10 requests
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
          const sanitizedName = path.basename(file.originalname); // Removes any path components
          const ext = path.extname(sanitizedName); // Get extension

          // UUID + extension only (ignore original filename)
          const safeFilename = `${randomUUID()}${ext}`;
          cb(null, safeFilename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024 * 1024, // 5GB limit (for Pro users)
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

    // Validate file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension) {
      throw new BadRequestException('File must have an extension');
    }

    // Validate MIME type mathches extension
    const expectedMimeTypes = allowedMimeTypes[fileExtension];
    if (expectedMimeTypes && file.mimetype) {
      if (!expectedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File MIME type (${file.mimetype}) does not match file extension (.${fileExtension})`,
        );
      }
    }

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
      ? 5 * 1024 * 1024 * 1024 // 5GB
      : 500 * 1024 * 1024; // 500MB

    if (file.size > maxFileSizeBytes) {
      const maxSize = isPro ? '5GB' : '500MB';
      throw new BadRequestException(
        `File size exceeds the limit. Maximum file size for ${isPro ? 'Pro' : 'Free'} plan is ${maxSize}.`,
      );
    }

    // Validate video duration for video files
    // Note: File is saved by multer to file.path when using diskStorage
    const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv'];
    if (fileExtension && videoFormats.includes(fileExtension) && file.path) {
      try {
        const duration = await processors.getFileDurationInSeconds(file.path);
        if (duration !== null) {
          const maxDurationSeconds = isPro ? 30 * 60 : 3 * 60; // 30 min pro, 3 min free
          const maxDurationMinutes = isPro ? 30 : 3;

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

    // Validate that download link generation requires Pro plan
    if (generateLink && !isPro) {
      throw new BadRequestException(
        'Download link generation is a Pro feature. Please upgrade to Pro to use this feature.',
      );
    }

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
