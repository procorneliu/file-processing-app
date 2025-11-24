import { useFile } from '../../../contexts/FileContext';
import FormatsList from './FormatsList';
import { useSubscription } from '../../../hooks/useSubscription';

export type FormatOption = { value: string; label: string };

type ConvertToProps = {
  fileExtension: string | undefined;
  processType: string;
};

function ConvertToList({ fileExtension, processType }: ConvertToProps) {
  const { convertTo, setConvertTo, setProcessedFile } = useFile();
  const { isPro } = useSubscription();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!isPro) return;
    setProcessedFile(null);
    setConvertTo(e.target.value);
  }

  return (
    <div className="flex justify-center space-x-2 pb-2">
      <p className="mr-auto">Format:</p>
      <p>From</p>
      <span className="text-blue-500">{fileExtension}</span>
      <label htmlFor="format ">To</label>
      <select
        name="to"
        id="format"
        value={convertTo}
        onChange={handleChange}
        disabled={!isPro}
        className="rounded-md border disabled:cursor-not-allowed disabled:opacity-50"
      >
        {processType === 'video_video' && <FormatsList format="video" />}
        {processType === 'video_audio' && <FormatsList format="audio" />}
        {processType === 'audio_audio' && <FormatsList format="audio" />}
        {processType === 'video_image' && <FormatsList format="image" />}
      </select>
    </div>
  );
}

export default ConvertToList;
