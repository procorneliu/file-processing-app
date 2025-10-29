import { extractAudio } from '../../api/fileProcessing';
import { useCard } from '../../contexts/CardContext';
import { useFile } from '../../contexts/FileContext';
import Button from '../../ui/Button';

function CardSettings() {
  const { activeCard } = useCard();
  const { file, processedFile, setProcessedFile } = useFile();

  if (!activeCard) return null;
  const { title, body } = activeCard;

  async function handleClickAction() {
    if (!file) {
      setProcessedFile(null);
      return;
    }

    setProcessedFile(null);

    try {
      const { url, filename } = await extractAudio(file);
      setProcessedFile({ url, filename });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex flex-col space-y-2 divide-y divide-gray-500 rounded-md border p-7 text-center">
      <h3 className="pb-2 font-bold uppercase">{title}</h3>
      <p className="w-80 pb-2">{body}</p>
      <Button action={handleClickAction}>Start Processing</Button>
      {processedFile && (
        <a
          href={processedFile.url}
          download={processedFile.filename}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Download processed file
        </a>
      )}
    </div>
  );
}

export default CardSettings;
