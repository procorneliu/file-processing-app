const DEFAULT_MESSAGE =
  'This is a Pro feature. Go to your account and upgrade to Pro to unlock this setting.';

type TooltipProps = {
  message?: string;
  disabled?: boolean;
};

function Tooltip({
  message = DEFAULT_MESSAGE,
  disabled = false,
}: TooltipProps) {
  if (!disabled) {
    return null;
  }

  return (
    <div className="invisible absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-0 group-hover:visible group-hover:opacity-100">
      {message}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
    </div>
  );
}

export default Tooltip;
