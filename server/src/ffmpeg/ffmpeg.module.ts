import { Module } from '@nestjs/common';
import { FfmpegController } from './ffmpeg.controller';
import { FfmpegService } from './ffmpeg.service';
import { StorageService } from 'src/storage/storage.service';

@Module({
  controllers: [FfmpegController],
  providers: [FfmpegService, StorageService],
})
export class FfmpegModule {}
