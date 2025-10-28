import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FfmpegModule } from './ffmpeg/ffmpeg.module';

@Module({
  imports: [FfmpegModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
