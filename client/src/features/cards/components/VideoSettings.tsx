import { type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { useFile } from '../../../contexts/FileContext';
import type { ProcessingOptions } from '../../../hooks/useProcessingJob';
import { useSubscription } from '../../../hooks/useSubscription';
import Tooltip from '../../../ui/Tooltip';

type ResolutionItem = {
  resolution: string;
};

type VideoSettings = {
  options: ProcessingOptions;
  onChange: Dispatch<SetStateAction<ProcessingOptions>>;
  isVideoImage: boolean;
};

type FpsSettings = Omit<VideoSettings, 'isVideoImage'>;
type ResolutionSettings = VideoSettings;

const VIDEO_RESOLUTIONS = [
  '256x144',
  '426x240',
  '640x360',
  '1280x720',
  '1920x1080',
  '3840x2160',
];

function VideoSettings({ options, onChange, isVideoImage }: VideoSettings) {
  return (
    <div className="space-y-2 pb-2">
      <Resolution
        options={options}
        onChange={onChange}
        isVideoImage={isVideoImage}
      />
      <FpsSetting options={options} onChange={onChange} />
    </div>
  );
}

function Resolution({ options, onChange, isVideoImage }: ResolutionSettings) {
  const { setProcessedFile } = useFile();
  const { isPro } = useSubscription();
  const resolutions = !isVideoImage
    ? VIDEO_RESOLUTIONS
    : VIDEO_RESOLUTIONS.slice(0, VIDEO_RESOLUTIONS.length - 1);

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    if (!isPro) return;
    const nextResolution = e.target.value;
    onChange((prev) => ({ ...prev, resolution: nextResolution }));
    setProcessedFile(null);
  }

  return (
    <div className="flex justify-between">
      <p className="flex items-center gap-1">Output resolution:</p>
      <div className="group relative inline-block">
        <select
          name="video-settings"
          id="video-settings"
          className="ml-auto rounded-md border disabled:cursor-not-allowed disabled:opacity-50"
          value={options.resolution}
          onChange={handleChange}
          disabled={!isPro}
        >
          {resolutions.map((resolution) => (
            <ResolutionItem resolution={resolution} key={resolution} />
          ))}
        </select>
        <Tooltip disabled={!isPro} />
      </div>
    </div>
  );
}

function ResolutionItem({ resolution }: ResolutionItem) {
  return <option value={resolution}>{resolution}</option>;
}

function FpsSetting({ options, onChange }: FpsSettings) {
  const { setProcessedFile } = useFile();
  const { isPro } = useSubscription();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!isPro) return;
    const nextFps = e.target.value;
    onChange((prev) => ({ ...prev, fps: nextFps }));
    setProcessedFile(null);
  }

  return (
    <div className="flex justify-between">
      <p>
        Fps: <span>{options.fps ?? 30}</span>
      </p>

      <div className="group relative inline-block">
        <input
          type="range"
          name="fps"
          id="fps"
          value={options.fps ? Number(options.fps) : 30}
          onChange={handleChange}
          min={1}
          max={30}
          disabled={!isPro}
          className="disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Tooltip disabled={!isPro} />
      </div>
    </div>
  );
}

export default VideoSettings;
