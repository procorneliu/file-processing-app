import ButtonLink from '../ui/ButtonLink';
import AuthButton from '../components/AuthButton';

function Home() {
  return (
    <main className="relative h-screen w-screen bg-linear-to-br from-gray-900 to-gray-950">
      <div className="absolute right-4 top-4 z-10">
        <AuthButton />
      </div>
      <div className="flex h-full flex-col items-center justify-center space-y-3 text-center text-stone-50">
        <h1 className="text-4xl font-semibold">Process your file</h1>
        <p className="w-80 pb-3 text-sm text-stone-300">
          From video or audio file to whatever you want. From changing file
          format to audio denoising.
        </p>
        <ButtonLink>Start processing</ButtonLink>
      </div>
    </main>
  );
}

export default Home;
