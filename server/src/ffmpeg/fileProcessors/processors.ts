import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import { NotAcceptableException } from '@nestjs/common';

type ProcessingOptions = {
  bitrate?: string;
};

type CodecProfile = {
  codec: string;
  supportsBitrate: boolean;
};

const AUDIO_CODEC_MAP: Record<string, CodecProfile> = {
  mp3: { codec: 'libmp3lame', supportsBitrate: true },
  mp2: { codec: 'mp2', supportsBitrate: true },
  mp4: { codec: 'aac', supportsBitrate: true },
  aac: { codec: 'aac', supportsBitrate: true },
  m4a: { codec: 'aac', supportsBitrate: true },
  ogg: { codec: 'libvorbis', supportsBitrate: true },
  opus: { codec: 'libopus', supportsBitrate: true },
  ogv: { codec: 'libvorbis', supportsBitrate: true },
  wma: { codec: 'wmav2', supportsBitrate: true },
  flac: { codec: 'flac', supportsBitrate: false },
  alac: { codec: 'alac', supportsBitrate: false },
  wav: { codec: 'pcm_s16le', supportsBitrate: false },
  aiff: { codec: 'pcm_s16be', supportsBitrate: false },
  aif: { codec: 'pcm_s16be', supportsBitrate: false },
  amr: { codec: 'libopencore_amrnb', supportsBitrate: true },
  ac3: { codec: 'ac3', supportsBitrate: true },
  dts: { codec: 'dca', supportsBitrate: true },
  spx: { codec: 'libspeex', supportsBitrate: true },
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
    convertTo?: string,
  ) {
    // const allowedFormats = ['mp4', 'mov'];
    const { bitrate }: ProcessingOptions = options ? JSON.parse(options) : {};

    // check if file format is allowed
    // this.isFileAllowed(inputPath, allowedFormats);

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
