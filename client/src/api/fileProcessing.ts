import axios from 'axios';
import { API_BASE, type ProcessingOptions } from '../hooks/useProcessingJob';

type ExtractAudioResult = {
  url: string;
  filename: string;
};

export async function processFile(
  file: File,
  type: string,
  convertTo: string,
  jobId: string,
  options: ProcessingOptions,
): Promise<ExtractAudioResult | null> {
  const form = new FormData();

  form.append('file', file);
  form.append('type', type);
  form.append('convertTo', convertTo);
  form.append('jobId', jobId);
  form.append('options', JSON.stringify(options));

  const res = await axios.post(`${API_BASE}`, form, {
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
  const extension = res.data.type === 'application/zip' ? 'zip' : convertTo;
  const filename = `${modeledFileName(file.name)}.${extension}`;

  return { url, filename };
}

function modeledFileName(fileName: string) {
  const modeled = fileName.split('.')[0].replaceAll(' ', '_').toLowerCase();
  return modeled;
}
