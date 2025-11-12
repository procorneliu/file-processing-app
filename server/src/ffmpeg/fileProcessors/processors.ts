import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import { NotAcceptableException } from '@nestjs/common';
import { CodecProfile } from '../ffmpeg.types';
import { ALL_FORMATS, AUDIO_CODEC_MAP } from '../ffmpeg.constants';
import getFileExtension from '../helpers/getFileExtension';
import { createTempOutputPath } from '../helpers/outputNamer';
import { JobRecord } from '../ffmpeg.service';

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
        `File format ${inputFileExtension} is not supported for this conversion`,
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

  static async hasFileVideo(filePath: string): Promise<boolean> {
    const result = await new Promise<boolean>((resolve, reject) => {
      ffmpeg(filePath).ffprobe((err: Error, metadata) => {
        if (err) reject(err);

        const hasVideo = metadata.streams.some(
          (stream) => stream.codec_type === 'video',
        );

        resolve(hasVideo);
      });
    });

    return result;
  }

  static async convertToAudio(
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

    // Check if file has video streams - only apply noVideo() if it does
    const hasVideo = await this.hasFileVideo(inputPath);

    const targetExtension =
      convertTo ?? path.extname(outputPath).replace('.', '');
    const { codec, supportsBitrate } = resolveAudioCodec(targetExtension);

    const command = ffmpeg(inputPath);

    // Only remove video if the input file has video streams
    if (hasVideo) {
      command.noVideo();
    }

    command.audioCodec(codec);

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
    jobId: string,
    jobs: Map<string, JobRecord>,
    onProgress?: (percent: number) => void | Promise<void>,
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

      jobs.set(jobId, {
        command: videoCommand,
        cleanupTargets,
        cancelled: false,
      });

      await new Promise<void>((resolve, reject) => {
        videoCommand
          .on('progress', (progress) => {
            if (progress.percent && onProgress) {
              const scaledPercent = Math.floor(progress.percent / 2);
              const result = onProgress(scaledPercent);
              if (result instanceof Promise) {
                result.catch(() => {
                  /* empty */
                });
              }
            }
          })
          .on('error', (error: Error) => {
            reject(error);
          })
          .on('end', () => {
            // First step complete, emit 50%
            if (onProgress) {
              const result = onProgress(50);
              if (result instanceof Promise) {
                result.catch(() => {
                  /* empty */
                });
              }
            }
            resolve();
          })
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
