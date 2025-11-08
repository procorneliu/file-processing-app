import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import { NotAcceptableException } from '@nestjs/common';
import { CodecProfile } from '../ffmpeg.types';
import { ALL_FORMATS, AUDIO_CODEC_MAP } from '../ffmpeg.constants';

type ProcessingOptions = {
  bitrate?: string;
  resolution?: string;
};

function resolveAudioCodec(extension?: string): CodecProfile {
  if (!extension) return AUDIO_CODEC_MAP.mp3;
  const normalized = extension.replace('.', '').toLowerCase();
  return AUDIO_CODEC_MAP[normalized] ?? AUDIO_CODEC_MAP.mp3;
}

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

  static async videoToAudio(
    inputPath: string,
    outputPath: string,
    options: string,
    convertTo: string,
  ) {
    const { bitrate }: ProcessingOptions = options ? JSON.parse(options) : {};

    // check if file format is allowed
    this.isFileAllowed(inputPath, ALL_FORMATS);

    // Check if file has audio
    await this.hasFileAudio(inputPath);

    const targetExtension =
      convertTo ?? path.extname(outputPath).replace('.', '');
    const { codec, supportsBitrate } = resolveAudioCodec(targetExtension);

    const command = ffmpeg(inputPath).noVideo().audioCodec(codec);

    if (supportsBitrate && bitrate) {
      command.audioBitrate(bitrate);
    }

    return command.output(outputPath);
  }

  static videoToVideo(inputPath: string, outputPath: string, options: string) {
    const { resolution }: ProcessingOptions = options
      ? JSON.parse(options)
      : {};

    const command = ffmpeg(inputPath);

    // Add resolution setting option
    if (resolution) {
      command.size(resolution);
    }

    return command.output(outputPath);
  }

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
