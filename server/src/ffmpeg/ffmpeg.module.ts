import { Module } from '@nestjs/common';
import { FfmpegController } from './ffmpeg.controller';
import { FfmpegService } from './ffmpeg.service';
import { StorageService } from 'src/storage/storage.service';
import { AuthModule } from '../auth/auth.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { SubscriptionThrottlerGuard } from './guards/subscription-throttler.guard';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    AuthModule,
    SubscriptionModule,
    ThrottlerModule.forRoot([
      {
        ttl: 3600, // 1 hour
        limit: 20, // Max limit (will be overridden by guard for free users)
      },
    ]),
  ],
  controllers: [FfmpegController],
  providers: [FfmpegService, StorageService, SubscriptionThrottlerGuard],
})
export class FfmpegModule {}
