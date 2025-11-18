import { useState } from 'react';
import { LuCopy, LuCheck } from 'react-icons/lu';

type DownloadLinkProps = {
  link: string;
};

function DownloadLink({ link }: DownloadLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        value={link}
        readOnly
        className="w-full rounded-md border border-stone-500 px-3 py-2 pr-10 text-sm text-stone-100 transition-all duration-300 outline-none focus:ring focus:ring-blue-400"
      />
      <button
        onClick={handleCopy}
        className="absolute right-2 flex items-center justify-center rounded p-1.5 text-stone-400 transition-colors hover:bg-gray-800 hover:text-stone-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        aria-label="Copy link"
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? (
          <LuCheck className="h-4 w-4 text-green-500" />
        ) : (
          <LuCopy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export default DownloadLink;
