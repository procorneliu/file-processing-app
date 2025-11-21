import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './exceptions/all-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { json } from 'express';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 'loopback');

  app.enableCors({
    origin: process.env.CLIENT_URL, // Remove trailing slash to match actual origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
  });

  app.use(cookieParser());

  // JSON body parser for all routes except webhook
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/api/subscription/webhook') {
      return next();
    }
    return json()(req, res, next);
  });

  // Raw body for Stripe webhook verification
  app.use(
    '/api/subscription/webhook',
    json({
      verify: (req: Request, res: Response, buf: Buffer) => {
        const request = req as Request & { rawBody?: Buffer };
        request.rawBody = buf;
      },
    }),
  );

  app.setGlobalPrefix('/api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
