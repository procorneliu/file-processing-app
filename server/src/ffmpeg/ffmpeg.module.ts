import { Module } from '@nestjs/common';
import { FfmpegController } from './ffmpeg.controller';
import { FfmpegService } from './ffmpeg.service';

@Module({
  controllers: [FfmpegController],
  providers: [FfmpegService],
})
export class FfmpegModule {}
