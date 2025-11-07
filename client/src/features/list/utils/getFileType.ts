import getFormats from '../../../data/getFormats';
import { getFileExtension } from '../../../utils/getFileExtension';

export function getFileType(fileName: string | undefined) {
  const videoFormats = getFormats('video');
  const audioFormats = getFormats('audio');
  const imageFormats = getFormats('image');

  const fileExtension = getFileExtension(fileName);
  if (!fileExtension) return;

  if (videoFormats.includes(fileExtension)) {
    return 'video';
  } else if (audioFormats.includes(fileExtension)) {
    return 'audio';
  } else if (imageFormats.includes(fileExtension)) {
    return 'image';
  } else {
    // throw new Error('File format not supported');
    return null;
  }
}
