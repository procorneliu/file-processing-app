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
  generateDownloadLink: string,
  options: ProcessingOptions,
): Promise<ExtractAudioResult | null> {
  const form = new FormData();

  form.append('generateDownloadLink', String(generateDownloadLink));
  form.append('file', file);
  form.append('type', type);
  form.append('convertTo', convertTo);
  form.append('jobId', jobId);
  form.append('options', JSON.stringify(options));

  const shouldGenerateLink = generateDownloadLink === 'true';

  const res = await axios.post(`${API_BASE}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: shouldGenerateLink ? 'json' : 'blob',
    withCredentials: true,
  });

  if (res.status === 204) {
    return null;
  }

  // If generateDownloadLink is true, expect JSON response with presigned URL
  if (shouldGenerateLink) {
    const data = res.data;
    if (!data || !data.url || !data.filename) {
      return null;
    }
    return { url: data.url, filename: data.filename };
  }

  // If generateDownloadLink is false, expect blob response for instant download
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
