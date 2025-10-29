import axios from 'axios';

type ExtractAudioResult = {
  url: string;
  filename: string;
};

export async function extractAudio(file: File): Promise<ExtractAudioResult> {
  const form = new FormData();
  form.append('file', file);

  const res = await axios.post(
    'http://localhost:3000/api/extract/audio',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
    },
  );

  const blob = res.data as Blob;
  const url = URL.createObjectURL(blob);

  const filename = `${modeledFileName(file.name)}-processed.mp3`;

  return { url, filename };
}

function modeledFileName(fileName: string) {
  const modeled = fileName.split('.')[0].replaceAll(' ', '_').toLowerCase();
  return modeled;
}
