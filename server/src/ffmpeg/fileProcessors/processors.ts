import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';

export default class processors {
  constructor() {
    if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic);
  }

  static convertToMp3(inputPath: string, outputPath: string) {
    return ffmpeg(inputPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate('192k')
      .format('mp3')
      .output(outputPath);
  }

  static extractAllPng(inputPath: string, outputPath: string) {
    return ffmpeg(inputPath)
      .noAudio()
      .videoCodec('png')
      .format('image2')
      .outputOptions(['-start_number', '1', '-vsync', '0'])
      .output(path.join(outputPath, 'frame_%05d.png'));
  }
}
