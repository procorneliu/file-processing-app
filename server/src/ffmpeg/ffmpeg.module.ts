import { Module } from '@nestjs/common';
import { FfmpegController } from './ffmpeg.controller';
import { FfmpegService } from './ffmpeg.service';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'processing',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
  ],
  controllers: [FfmpegController],
  providers: [FfmpegService],
})
export class FfmpegModule {}
