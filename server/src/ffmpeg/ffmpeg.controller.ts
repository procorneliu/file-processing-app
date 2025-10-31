import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  MessageEvent,
  Param,
  Post,
  Sse,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
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
    @Body('type') type: string,
    @Body('jobId') jobId: string,
  ): Promise<StreamableFile> {
    if (!file) throw new BadRequestException('File upload is required');
    if (!jobId) throw new BadRequestException('JobId is required');

    const result = await this.ffmpegService.handle(file, type, jobId);

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
