import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import { NotAcceptableException } from '@nestjs/common';

export default class processors {
  constructor() {
    if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic);
  }

  static isFileAllowed(inputPath: string, allowedList: string[]) {
    const inputFileExtension = path
      .extname(inputPath)
      .replace('.', '')
      .toLowerCase();

    if (!allowedList.includes(inputFileExtension))
      throw new NotAcceptableException(
        `You cannot convert ${inputFileExtension} to an audio file`,
      );
  }

  static async hasFileAudio(filePath: string) {
    const result = await new Promise((resolve, reject) => {
      ffmpeg(filePath).ffprobe((err: Error, metadata) => {
        if (err) reject(err);

        const hasAudio = metadata.streams.some(
          (stream) => stream.codec_type === 'audio',
        );

        resolve(hasAudio);
      });
    });

    if (!result)
      throw new NotAcceptableException(
        'File is not compatible for this processing type.',
      );
  }

  static async convertToMp3(inputPath: string, outputPath: string) {
    const allowedFormats = ['mp4', 'mov'];

    // check if file format is allowed
    this.isFileAllowed(inputPath, allowedFormats);

    // Check if file has audio
    await this.hasFileAudio(inputPath);

    return ffmpeg(inputPath).output(outputPath);
  }

  // static async convertToMp3(inputPath: string, outputPath: string) {
  //   const allowedFormats = ['mp4', 'mov'];

  //   // check if file format is allowed
  //   this.isFileAllowed(inputPath, allowedFormats);

  //   // Check if file has audio
  //   await this.hasFileAudio(inputPath);

  //   return ffmpeg(inputPath)
  //     .noVideo()
  //     .audioCodec('libmp3lame')
  //     .audioBitrate('192k')
  //     .format('mp3')
  //     .output(outputPath);
  // }

  static extractAllPng(inputPath: string, outputPath: string) {
    const allowedFormats = ['mp4', 'mov'];

    this.isFileAllowed(inputPath, allowedFormats);

    return ffmpeg(inputPath)
      .noAudio()
      .videoCodec('png')
      .format('image2')
      .outputOptions(['-start_number', '1', '-vsync', '0'])
      .output(path.join(outputPath, 'frame_%05d.png'));
  }
}
