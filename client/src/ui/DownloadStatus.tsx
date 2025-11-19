import { useNavigate } from 'react-router-dom';
import { useProcessingMode } from '../contexts/ProcessingModeContext';

function DownloadStatus() {
  const { generateDownloadLink } = useProcessingMode();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <button
      onClick={handleClick}
      className="absolute left-4 top-4 z-10 rounded-lg bg-gray-800/80 px-4 py-2 text-sm font-medium text-stone-100 backdrop-blur-sm transition-colors hover:bg-gray-700/80 cursor-pointer"
    >
      {generateDownloadLink ? 'Get Download Link' : 'Get Processed File'}
    </button>
  );
}

export default DownloadStatus;

