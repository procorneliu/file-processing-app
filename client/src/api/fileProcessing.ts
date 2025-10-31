import axios from 'axios';

type ExtractAudioResult = {
  url: string;
  filename: string;
};

export async function processFile(
  file: File,
  type: string,
  jobId: string,
): Promise<ExtractAudioResult | null> {
  const form = new FormData();
  form.append('file', file);
  form.append('type', type);
  form.append('jobId', jobId);

  const res = await axios.post('http://localhost:3000/api/process', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });

  if (res.status === 204) {
    return null;
  }

  const blob = res.data as Blob;
  if (!blob || blob.size === 0) {
    return null;
  }
  const url = URL.createObjectURL(blob);

  const extension =
    type === 'mp4_mp3' ? '.mp3' : type === 'mp4_png' ? '.zip' : '';
  const filename = `${modeledFileName(file.name)}${extension}`;

  return { url, filename };
}

function modeledFileName(fileName: string) {
  const modeled = fileName.split('.')[0].replaceAll(' ', '_').toLowerCase();
  return modeled;
}
