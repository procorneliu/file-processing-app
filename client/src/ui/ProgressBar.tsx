type ProgressProp = {
  progress: number;
};

function ProgressBar({ progress }: ProgressProp) {
  return (
    <div className="w-full pt-4">
      <div className="h-2 w-full rounded-full bg-gray-700">
        <div
          className="h-2 rounded-full bg-blue-500 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-300">{progress}%</p>
    </div>
  );
}

export default ProgressBar;
