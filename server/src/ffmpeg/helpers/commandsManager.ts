import processors from '../fileProcessors/processors';
import { FfmpegCommand } from 'fluent-ffmpeg';

export async function buildCommand(
  inputPath: string,
  outputPath: string,
  type: string,
  options: string,
  convertTo: string,
  onProgress?: (percent: number) => Promise<void>,
): Promise<{ command: FfmpegCommand; cleanupTargets?: string[] }> {
  switch (type) {
    case 'video_audio':
      return processors.convertToAudio(
        inputPath,
        outputPath,
        options,
        convertTo,
      );
    case 'audio_audio':
      return processors.convertToAudio(
        inputPath,
        outputPath,
        options,
        convertTo,
      );
    case 'video_video':
      return processors.videoToVideo(inputPath, outputPath, options);
    case 'video_image':
      return processors.videoToImage(
        inputPath,
        outputPath,
        options,
        convertTo,
        onProgress,
      );
    default:
      throw new Error(`Unsupported process type: ${type}`);
  }
}
