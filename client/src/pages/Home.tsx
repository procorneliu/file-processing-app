import ButtonLink from '../ui/ButtonLink';
import AuthButton from '../components/AuthButton';
import { useProcessingMode } from '../contexts/ProcessingModeContext';

function Home() {
  const { setGenerateDownloadLink } = useProcessingMode();

  return (
    <main className="relative h-screen w-screen bg-linear-to-br from-gray-900 to-gray-950">
      <div className="absolute top-4 right-4 z-10">
        <AuthButton />
      </div>
      <div className="flex h-full flex-col items-center justify-center space-y-3 text-center text-stone-50">
        <h1 className="text-4xl font-semibold">Process your file</h1>
        <p className="w-80 pb-3 text-sm text-stone-300">
          From video or audio file to whatever you want. From changing file
          format to audio denoising.
        </p>
        <div className="flex gap-x-4">
          <ButtonLink onClick={() => setGenerateDownloadLink(false)}>
            Get Processed File
          </ButtonLink>
          <ButtonLink onClick={() => setGenerateDownloadLink(true)}>
            Get Download Link
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}

export default Home;
