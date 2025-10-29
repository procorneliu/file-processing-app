import { Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import { PassThrough, Readable } from 'stream';

@Injectable()
export class FfmpegService {
  constructor() {
    ffmpeg.setFfmpegPath(ffmpegStatic!);
  }

  private bufferToStream(buf: Buffer): Readable {
    return Readable.from(buf);
  }

  async extractAudio(file: Express.Multer.File) {
    const input: Readable = this.bufferToStream(file.buffer);
    const outputStream = new PassThrough();
    const command = ffmpeg()
      .input(input)
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        }
      });

    const chunks: Buffer[] = [];

    return await new Promise<{
      buffer: Buffer;
      filename: string;
      mimeType: string;
    }>((resolve, reject) => {
      command
        .on('error', (error) => {
          console.log(error);
          reject(error);
        })
        .pipe(outputStream, { end: true });

      outputStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      outputStream.on('end', () => {
        const filename = this.buildOutputName(file.originalname);
        resolve({
          buffer: Buffer.concat(chunks),
          filename,
          mimeType: 'audio/mpeg',
        });
      });

      outputStream.on('error', (error) => {
        console.log(error);
        reject(error);
      });
    });
  }

  private buildOutputName(inputName: string) {
    const { name } = path.parse(inputName);
    return `${name || 'processed-audio'}.mp3`;
  }

  extractImages() {
    const inputFile = path.join(__dirname, '../../data/video.mov');
    const outputFile = path.join(__dirname, '../../data/images/frame-%03d.png');

    ffmpeg()
      .input(inputFile)
      .fps(10)
      .saveToFile(outputFile)
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        }
      })
      .on('end', () => {
        console.log('FFmpeg has finished');
      })
      .on('error', (error) => {
        console.log(error);
      });
  }

  audioDenoise() {
    const inputFile = path.join(__dirname, '../../data/noise_rec.m4a');
    const outputFile = path.join(__dirname, '../../data/denoise-video.wav');
    const filters = 'afftdn=nr=20:nf=-30:tn=1';

    ffmpeg()
      .input(inputFile)
      .audioFilters(filters)
      .saveToFile(outputFile)
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Processing: ${Math.floor(progress.percent)}% done`);
        }
      })
      .on('end', () => {
        console.log('FFmpeg has finished');
      })
      .on('error', (error) => {
        console.log(error);
      });
  }
}
