import { useEffect } from 'react';

import { useCard } from '../../contexts/CardContext';
import { useFile } from '../../contexts/FileContext';

import Button from '../../ui/Button';
import ProgressBar from '../../ui/ProgressBar';
import ErrorMessage from '../../ui/ErrorMessage';

import DownloadButton from '../../ui/DownloadButton';
import useProcessingJob from '../../hooks/useProcessingJob';
import ConvertToList from './ui/ConvertToList';
import { getFileExtension } from '../../utils/getFileExtension';

function CardSettings() {
  const { activeCard } = useCard();
  const { file, processedFile, setProcessedFile } = useFile();
  const { start, cancel, status, progress, error, download } =
    useProcessingJob();

  const fileExtension = file
    ? getFileExtension(file.name)?.toUpperCase()
    : '...';

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

  function handleClickAction() {
    if (!file || !processType || isProcessing) {
      cancel();
      setProcessedFile(null);
      return;
    }
    start({ file, type: processType });
  }

  return (
    <div className="flex flex-col space-y-2 divide-y divide-gray-500 rounded-md border p-7 text-center">
      <h3 className="pb-2 font-bold uppercase">{title}</h3>
      <p className="w-80 pb-2">{body}</p>
      <ConvertToList fileExtension={fileExtension} processType={processType!} />

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
