import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });

    this.bucketName = this.configService.getOrThrow<string>('AWS_BUCKET_NAME');
  }

  async uploadFile(
    file: Buffer | Readable,
    filename: string,
    contentLength: number,
  ) {
    try {
      this.logger.log(
        `Starting S3 upload: ${filename} (${contentLength} bytes, type: ${Buffer.isBuffer(file) ? 'Buffer' : 'Stream'})`,
      );

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: file,
        ...(Buffer.isBuffer(file) && contentLength
          ? { ContentLength: contentLength }
          : {}),
      });

      await this.s3.send(command);
      this.logger.log(`S3 upload successful: ${filename}`);
    } catch (err) {
      throw new BadRequestException('Uploading file S3 bucket failed!', err);
    }
  }
}
