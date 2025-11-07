import { useEffect, useState } from 'react';

import { useCard } from '../../contexts/CardContext';
import { useFile } from '../../contexts/FileContext';

import Button from '../../ui/Button';
import ProgressBar from '../../ui/ProgressBar';
import ErrorMessage from '../../ui/ErrorMessage';

import DownloadButton from '../../ui/DownloadButton';
import useProcessingJob from '../../hooks/useProcessingJob';
import ConvertToList from './components/ConvertToList';
import { getFileExtension } from '../../utils/getFileExtension';
import AudioSettings from './components/AudioSettings';
import type { ProcessingOptions } from '../../hooks/useProcessingJob';

function CardSettings() {
  const { activeCard } = useCard();
  const { file, processedFile, setProcessedFile, fileType, convertTo } =
    useFile();
  const { start, cancel, status, progress, error, download } =
    useProcessingJob();
  const [audioOptions, setAudioOptions] = useState<ProcessingOptions>({
    bitrate: '192k',
  });

  const rawFileExtension = file ? getFileExtension(file.name) : null;
  const fileExtension = rawFileExtension?.toUpperCase() ?? '...';
  const sourceExtension = rawFileExtension?.toLowerCase() ?? null;

  useEffect(() => {
    setProcessedFile(download);
  }, [download, setProcessedFile]);

  useEffect(() => {
    setProcessedFile(null);
    void cancel();
  }, [activeCard?.id, cancel, setProcessedFile]);

  useEffect(() => {
    window.addEventListener('beforeunload', cancel);

    return () => {
      void cancel();
    };
  }, [cancel]);

  if (!activeCard) return null;

  const { title, body, type: processType } = activeCard;
  const isProcessing = status === 'running';
  const convertTarget = convertTo?.toLowerCase() ?? '';
  const sourceIsWav = sourceExtension === 'wav';
  const targetIsWav = convertTarget === 'wav';
  const producesAudioOutput =
    processType === 'audio_audio' || processType === 'video_audio';
  const hasCompatibleFile = fileType === 'audio' || fileType === 'video';
  const showAudioSettings =
    producesAudioOutput && hasCompatibleFile && !sourceIsWav && !targetIsWav;

  function handleClickAction() {
    if (!file || !processType || isProcessing) {
      cancel();
      setProcessedFile(null);
      return;
    }
    start({ file, type: processType, options: audioOptions });
  }

  return (
    <div className="flex flex-col space-y-2 divide-y divide-gray-500 rounded-md border p-7 text-center">
      <h3 className="pb-2 font-bold uppercase">{title}</h3>
      <p className="pb-2">{body}</p>
      <ConvertToList fileExtension={fileExtension} processType={processType!} />
      {showAudioSettings && (
        <AudioSettings options={audioOptions} onChange={setAudioOptions} />
      )}

      {!processedFile && (
        <Button action={handleClickAction}>
          {!isProcessing ? 'Start' : 'Stop'} Processing
        </Button>
      )}

      {isProcessing && <ProgressBar progress={progress} />}
      {error && <ErrorMessage message={error} />}
      {processedFile && <DownloadButton processedFile={processedFile} />}
    </div>
  );
}

export default CardSettings;
