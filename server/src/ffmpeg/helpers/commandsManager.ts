import processors from '../fileProcessors/processors';

export function buildCommand(
  inputPath: string,
  outputPath: string,
  type: string,
) {
  switch (type) {
    case 'mp4_mp3':
      return processors.convertToMp3(inputPath, outputPath);
    case 'mp4_png':
      return processors.extractAllPng(inputPath, outputPath);
    default:
      throw new Error(`Unsupported process type: ${type}`);
  }
}
