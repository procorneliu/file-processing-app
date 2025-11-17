import { type ChangeEvent, type Dispatch, type SetStateAction } from 'react';
import { useFile } from '../../../contexts/FileContext';
import type { ProcessingOptions } from '../../../hooks/useProcessingJob';

type ResolutionItem = {
  resolution: string;
};

type VideoSettings = {
  options: ProcessingOptions;
  onChange: Dispatch<SetStateAction<ProcessingOptions>>;
  isVideoImage: boolean;
};

type FpsSettings = Omit<VideoSettings, 'isVideoImage'>;

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

function Resolution({ options, onChange, isVideoImage }: VideoSettings) {
  const { setProcessedFile } = useFile();
  const resolutions = !isVideoImage
    ? VIDEO_RESOLUTIONS
    : VIDEO_RESOLUTIONS.slice(0, VIDEO_RESOLUTIONS.length - 1);

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const nextResolution = e.target.value;
    onChange((prev) => ({ ...prev, resolution: nextResolution }));
    setProcessedFile(null);
  }

  return (
    <div className="flex justify-between">
      <p className="flex items-center gap-1">Output resolution:</p>
      <select
        name="video-settings"
        id="video-settings"
        className="ml-auto rounded-md border"
        value={options.resolution}
        onChange={handleChange}
      >
        {resolutions.map((resolution) => (
          <ResolutionItem resolution={resolution} key={resolution} />
        ))}
      </select>
    </div>
  );
}

function ResolutionItem({ resolution }: ResolutionItem) {
  return <option value={resolution}>{resolution}</option>;
}

function FpsSetting({ options, onChange }: FpsSettings) {
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
        max={30}
      />
    </div>
  );
}

export default VideoSettings;
