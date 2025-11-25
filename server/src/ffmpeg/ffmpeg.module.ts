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
    ThrottlerModule, // Import without forRoot() since it's initialized in AppModule
    AuthModule,
    SubscriptionModule,
  ],
  controllers: [FfmpegController],
  providers: [FfmpegService, StorageService, SubscriptionThrottlerGuard],
})
export class FfmpegModule {}
