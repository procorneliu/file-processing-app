import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import { NotAcceptableException } from '@nestjs/common';
import { CodecProfile } from '../ffmpeg.types';
import { ALL_FORMATS, AUDIO_CODEC_MAP } from '../ffmpeg.constants';
import getFileExtension from '../helpers/getFileExtension';
import { createTempOutputPath } from '../helpers/outputNamer';

type ProcessingOptions = {
  bitrate?: string;
  resolution?: string;
  fps?: string;
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
    const inputFileExtension = getFileExtension(inputPath);

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
    // check if file format is allowed
    this.isFileAllowed(inputPath, ALL_FORMATS);

    const { bitrate }: ProcessingOptions = options ? JSON.parse(options) : {};

    // Check if file has audio
    await this.hasFileAudio(inputPath);

    const targetExtension =
      convertTo ?? path.extname(outputPath).replace('.', '');
    const { codec, supportsBitrate } = resolveAudioCodec(targetExtension);

    const command = ffmpeg(inputPath).noVideo().audioCodec(codec);

    if (supportsBitrate && bitrate) {
      command.audioBitrate(bitrate);
    }

    return { command: command.output(outputPath) };
  }

  // convert video to another video format
  static videoToVideo(inputPath: string, outputPath: string, options: string) {
    // check if file format is allowed
    this.isFileAllowed(inputPath, ALL_FORMATS);

    const { resolution, fps }: ProcessingOptions = options
      ? JSON.parse(options)
      : {};

    const command = ffmpeg(inputPath);

    if (fps) {
      command.fps(Number(fps));
    }

    // Add resolution setting option
    if (resolution) {
      command.size(resolution);
    }

    return { command: command.output(outputPath) };
  }

  static async videoToImage(
    inputPath: string,
    outputPath: string,
    options: string,
    convertTo: string,
  ): Promise<{ command: ReturnType<typeof ffmpeg>; cleanupTargets: string[] }> {
    // check if file format is allowed
    this.isFileAllowed(inputPath, ALL_FORMATS);

    const { resolution, fps }: ProcessingOptions = options
      ? JSON.parse(options)
      : {};

    let actualInputPath = inputPath;
    const cleanupTargets: string[] = [];

    // If fps or resolution is provided, first convert video to same format with new settings
    if (fps || resolution) {
      // Create a temporary intermediate video file
      const intermediatePath = createTempOutputPath(
        path.extname(inputPath).replace('.', '') || 'mp4',
      );
      cleanupTargets.push(intermediatePath);

      // Execute the video-to-video conversion
      const videoCommand = this.videoToVideo(
        inputPath,
        intermediatePath,
        options,
      ).command;

      await new Promise<void>((resolve, reject) => {
        videoCommand
          .on('error', (error: Error) => {
            reject(error);
          })
          .on('end', () => resolve())
          .run();
      });

      // Use the processed video as input for image sequence
      actualInputPath = intermediatePath;
    }

    const command = ffmpeg(actualInputPath).videoCodec('png').format('image2');

    return {
      command: command
        .outputOptions(['-start_number', '1', '-vsync', '0'])
        .output(path.join(outputPath, `frame_%05d.${convertTo}`)),
      cleanupTargets,
    };
  }
}
