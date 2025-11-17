import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  // CreateMultipartUploadCommand,
  // UploadPartCommand,
  // CompleteMultipartUploadCommand,
  // AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
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

  async uploadMultipart(file: Buffer | Readable, filename: string) {
    const contentLength = Buffer.isBuffer(file) ? file.length : undefined;

    const minPartSize = 8 * 1024 * 1024; // 8 MB
    const dynamicPartSize =
      contentLength !== undefined
        ? Math.max(Math.ceil(contentLength / 100), minPartSize)
        : minPartSize;

    try {
      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucketName,
          Key: filename,
          Body: file,
        },
        partSize: dynamicPartSize,
        queueSize: 4,
        leavePartsOnError: false,
      });

      this.logger.log(
        `Starting S3 upload: ${filename} (${contentLength} bytes, type: ${Buffer.isBuffer(file) ? 'Buffer' : 'Stream'})`,
      );
      const result = await upload.done();
      this.logger.log(`S3 upload successful: ${filename}`);

      return result;
    } catch (err) {
      throw new BadRequestException('Uploading file S3 bucket failed!', err);
    }
  }
}
