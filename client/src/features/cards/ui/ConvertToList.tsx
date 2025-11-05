import { useFile } from '../../../contexts/FileContext';
import AudioList from './AudioList';
import ImageList from './ImageList';
import VideoList from './VideoList';

export type FormatOption = { value: string; label: string };

type ConvertToProps = {
  fileExtension: string | undefined;
  processType: string;
};

function ConvertToList({ fileExtension, processType }: ConvertToProps) {
  const { convertTo, setConvertTo, setProcessedFile } = useFile();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setProcessedFile(null);
    setConvertTo(e.target.value);
  }

  return (
    <div className="flex justify-center space-x-2 pb-2">
      <p>From</p>
      <span className="text-blue-500">{fileExtension}</span>
      <label htmlFor="format ">To</label>
      <select
        name="to"
        id="format"
        value={convertTo}
        onChange={handleChange}
        className="rounded-md border"
      >
        {processType === 'video_video' && <VideoList />}
        {processType === 'video_audio' && <AudioList />}
        {processType === 'audio_audio' && <AudioList />}
        {processType === 'video_image' && <ImageList />}
      </select>
    </div>
  );
}

export default ConvertToList;
