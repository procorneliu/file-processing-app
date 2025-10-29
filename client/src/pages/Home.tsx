import ButtonLink from '../ui/ButtonLink';

function Home() {
  return (
    <main className="h-screen w-screen bg-linear-to-br from-gray-900 to-gray-950">
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
