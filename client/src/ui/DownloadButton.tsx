import type { ProcessedFile } from '../contexts/FileContext';

type ProcessedFileProp = {
  processedFile: ProcessedFile;
};

function DownloadButton({ processedFile }: ProcessedFileProp) {
  if (!processedFile) return null;

  return (
    <a
      href={processedFile.url}
      download={processedFile.filename}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
    >
      Download processed file
    </a>
  );
}

export default DownloadButton;
