const allFormats = {
  video: [
    'mp4',
    'mkv',
    'mov',
    'avi',
    'flv',
    'webm',
    'ts',
    'm2ts',
    '3gp',
    'ogv',
    'gif',
    'mxf',
    'vob',
    'mpg',
    'wmv',
    'f4v',
    'yuv',
    'mjpe',
    'nut',
  ],
  audio: [
    'mp3',
    'wav',
    'aac',
    'flac',
    'ogg',
    'm4a',
    'opus',
    'alac',
    'wma',
    'amr',
    'aiff',
    'au',
    'ac3',
    'dts',
    'mp2',
    'spx',
  ],
  image: [
    'png',
    'jpg',
    'jpeg',
    'bmp',
    'tiff',
    'webp',
    'avif',
    'jp2',
    'exr',
    'tga',
  ],
};

export default function getFormats(type: string) {
  switch (type) {
    case 'video':
      return allFormats.video;
    case 'audio':
      return allFormats.audio;
    case 'image':
      return allFormats.image;
    case 'all':
      return allFormats.video.concat(allFormats.audio).concat(allFormats.image);
    default:
      throw new Error('No formats found. Please reload page and try again.');
  }
}
