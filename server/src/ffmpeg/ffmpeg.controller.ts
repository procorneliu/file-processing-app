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
import type { Request } from 'express';
import { FfmpegService } from './ffmpeg.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Observable } from 'rxjs';

@Controller('process')
export class FfmpegController {
  constructor(private ffmpegService: FfmpegService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async processFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<StreamableFile> {
    if (!file) throw new BadRequestException('File upload is required');
    const { type, convertTo, jobId, options } = req.body;
    if (!jobId) throw new BadRequestException('JobId is required');
    const result = await this.ffmpegService.handle(
      file,
      type,
      convertTo,
      options,
      jobId,
    );

    if (!result) {
      throw new HttpException('', HttpStatus.NO_CONTENT);
    }

    const { buffer, filename, mimeType } = result;
    return new StreamableFile(buffer, {
      type: mimeType,
      disposition: `attachment; filename="${encodeURIComponent(filename)}"`,
      length: buffer.length,
    });
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
