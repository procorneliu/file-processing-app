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

  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl && process.env.NODE_ENV === 'production') {
    throw new Error(
      'CLIENT_URL environment variable is required in production.',
    );
  }

  app.use(json({ limit: '10mb' })); // Global JSON body size limit

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/api/subscription/webhook') {
      return next();
    }
    return json({ limit: '10mb' })(req, res, next); // add size limit
  });

  app.set(
    'trust proxy',
    process.env.TRUST_PROXY === 'true' ? true : 'loopback',
  );

  app.enableCors({
    origin: clientUrl || 'http://localhost:5173', // Remove trailing slash to match actual origin
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
