import {
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { FaCircleQuestion } from 'react-icons/fa6';
import { useFile } from '../../../contexts/FileContext';
import type { ProcessingOptions } from '../../../hooks/useProcessingJob';

type ResolutionItem = {
  resolution: string;
};

type VideoSettingsProps = {
  options: ProcessingOptions;
  onChange: Dispatch<SetStateAction<ProcessingOptions>>;
};

const VIDEO_RESOLUTIONS = [
  '3840x2160',
  '1920x1080',
  '1280x720',
  '640x360',
  '426x240',
  '256x144',
];

function VideoSettings({ options, onChange }: VideoSettingsProps) {
  return (
    <div className="space-y-2 pb-2">
      <Resolution options={options} onChange={onChange} />
      <FpsSetting options={options} onChange={onChange} />
    </div>
  );
}

function Resolution({ options, onChange }: VideoSettingsProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { setProcessedFile } = useFile();

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const nextResolution = e.target.value;
    onChange((prev) => ({ ...prev, resolution: nextResolution }));
    setProcessedFile(null);
  }

  return (
    <div className="flex justify-between">
      <p className="flex items-center gap-1">
        Output resolution:
        <span className="relative">
          <FaCircleQuestion
            className="cursor-help text-xs text-gray-500"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <div className="absolute top-6 left-0 z-50 w-64 rounded-md bg-gray-800 p-2 text-xs text-white shadow-lg">
              Video quality will not be looking good if you'll choose resolution
              higher than original size.
            </div>
          )}
        </span>
      </p>
      <select
        name="video-settings"
        id="video-settings"
        className="ml-auto rounded-md border"
        value={options.resolution}
        onChange={handleChange}
      >
        {VIDEO_RESOLUTIONS.map((resolution) => (
          <ResolutionItem resolution={resolution} key={resolution} />
        ))}
      </select>
    </div>
  );
}

function ResolutionItem({ resolution }: ResolutionItem) {
  return <option value={resolution}>{resolution}</option>;
}

function FpsSetting({ options, onChange }: VideoSettingsProps) {
  const { setProcessedFile } = useFile();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const nextFps = e.target.value;
    onChange((prev) => ({ ...prev, fps: nextFps }));
    setProcessedFile(null);
  }

  return (
    <div className="flex justify-between">
      <p>
        Fps: <span>{options.fps ?? 30}</span>
      </p>

      <input
        type="range"
        name="fps"
        id="fps"
        value={options.fps ? Number(options.fps) : 30}
        onChange={handleChange}
        min={1}
        max={60}
      />
    </div>
  );
}

export default VideoSettings;
