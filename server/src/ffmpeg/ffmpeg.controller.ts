/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FfmpegService } from './ffmpeg.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';

@Controller('extract')
export class FfmpegController {
  constructor(private ffmpegService: FfmpegService) {}

  @Post('/audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async extractAudio(
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!file) throw new BadRequestException('File upload is required');

    const { buffer, filename, mimeType } =
      await this.ffmpegService.extractAudio(file);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(
        filename,
      )}"`,
    });

    return new StreamableFile(buffer);
  }

  @Get('/images')
  extractImages() {
    return this.ffmpegService.extractImages();
  }

  @Get('/denoise')
  audioDenoise() {
    return this.ffmpegService.audioDenoise();
  }
}
