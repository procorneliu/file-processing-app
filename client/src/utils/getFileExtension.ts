export function getFileExtension(fileName: string | undefined) {
  if (fileName) {
    return fileName.split('.').pop();
  }

  return null;
}
