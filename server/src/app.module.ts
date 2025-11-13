import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FfmpegModule } from './ffmpeg/ffmpeg.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.getOrThrow<string>('THROTTLE_TTL')), // 60 sec
          limit: Number(config.getOrThrow<string>('THROTTLE_LIMIT')), // 1 request
        },
      ],
    }),
    FfmpegModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
