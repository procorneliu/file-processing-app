import processors from '../fileProcessors/processors';

export function buildCommand(
  inputPath: string,
  outputPath: string,
  type: string,
  options: string,
  convertTo: string,
) {
  console.log(type);
  switch (type) {
    case 'video_audio':
      return processors.videoToAudio(inputPath, outputPath, options, convertTo);
    case 'video_video':
      return processors.videoToVideo(inputPath, outputPath, options);
    // case 'mp4_png':
    //   return processors.extractAllPng(inputPath, outputPath, options);
    default:
      throw new Error(`Unsupported process type: ${type}`);
  }
}
