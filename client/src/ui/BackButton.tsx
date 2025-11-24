import { useNavigate } from 'react-router-dom';
import { LuArrowLeft } from 'react-icons/lu';

type BackButtonProps = {
  to?: string;
  label?: string;
};

function BackButton({ to = '/app', label = 'Back' }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-gray-800/80 px-4 py-2 text-sm font-medium text-stone-100 backdrop-blur-sm transition-colors hover:bg-gray-700/80 cursor-pointer"
    >
      <LuArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}

export default BackButton;

