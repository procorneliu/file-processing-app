import { Controller, Get } from '@nestjs/common';
import { FfmpegService } from './ffmpeg.service';

@Controller('extract')
export class FfmpegController {
  constructor(private ffmpegService: FfmpegService) {}

  @Get('/audio')
  extractAudio() {
    return this.ffmpegService.extractAudio();
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
