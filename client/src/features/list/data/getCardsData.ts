type CardData = {
  id: number;
  title: string;
  body: string;
  type: 'video_video' | 'video_audio' | 'audio_audio' | 'video_image';
  allowedFormats: 'video' | 'audio' | 'image';
};

const data: CardData[] = [
  {
    id: 1,
    title: 'Video to Video',
    body: 'Convert video file to any other video file format.',
    type: 'video_video',
    allowedFormats: 'video',
  },
  {
    id: 2,
    title: 'Video to Audio',
    body: 'Extract only audio channel from video file.',
    type: 'video_audio',
    allowedFormats: 'video',
  },
  {
    id: 3,
    title: 'Audio to Audio',
    body: 'Convert audio file to another audio format.',
    type: 'audio_audio',
    allowedFormats: 'audio',
  },
  {
    id: 4,
    title: 'Video to Image',
    body: 'Extract image frames from video file.',
    type: 'video_image',
    allowedFormats: 'video',
  },
];

export default function getCardsData() {
  return data;
}
