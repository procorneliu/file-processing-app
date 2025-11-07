import getFormats from '../../../data/getFormats';
import { getFileExtension } from '../../../utils/getFileExtension';
import type { FileType } from '../../../types/file';

export function getFileType(fileName: string | undefined): FileType {
  const videoFormats = getFormats('video');
  const audioFormats = getFormats('audio');
  const imageFormats = getFormats('image');

  const fileExtension = getFileExtension(fileName);
  if (!fileExtension) return null;

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
