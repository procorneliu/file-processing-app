import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
} from 'react';
import type { ProcessingOptions } from '../../../hooks/useProcessingJob';
import { useFile } from '../../../contexts/FileContext';
import { getFileExtension } from '../../../utils/getFileExtension';
import getFormats from '../../../data/getFormats';
import { getAudioBitrateOptions } from '../../../data/audioBitrates';

type BitrateProp = {
  value: string;
};

type AudioSettingsProps = {
  options: ProcessingOptions;
  onChange: Dispatch<SetStateAction<ProcessingOptions>>;
};

function AudioSettings({ options, onChange }: AudioSettingsProps) {
  const { file, convertTo, setProcessedFile } = useFile();
  const audioFormats = useMemo(() => getFormats('audio'), []);
  const sourceExtension = useMemo(
    () => getFileExtension(file?.name)?.toLowerCase() ?? null,
    [file?.name],
  );
  const targetExtension = convertTo?.toLowerCase() ?? null;

  const bitrateFormat = useMemo(() => {
    if (targetExtension && audioFormats.includes(targetExtension)) {
      return targetExtension;
    }

    if (sourceExtension && audioFormats.includes(sourceExtension)) {
      return sourceExtension;
    }

    return 'mp3';
  }, [audioFormats, sourceExtension, targetExtension]);

  const audioBitrates = useMemo(
    () => getAudioBitrateOptions(bitrateFormat),
    [bitrateFormat],
  );

  useEffect(() => {
    if (!audioBitrates.length) return;

    if (!options.bitrate || !audioBitrates.includes(options.bitrate)) {
      onChange((prev) => ({ ...prev, bitrate: audioBitrates[0] }));
    }
  }, [audioBitrates, onChange, options.bitrate]);

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const nextBitrate = e.target.value;
    onChange((prev) => ({ ...prev, bitrate: nextBitrate }));
    setProcessedFile(null);
  }

  if (!audioBitrates.length) return null;

  return (
    <div className="flex justify-center space-x-2 pb-2">
      <p>Audio bitrate:</p>
      <select
        name="to"
        id="format"
        value={options.bitrate}
        onChange={handleChange}
        className="ml-auto rounded-md border"
      >
        {audioBitrates.map((bitrate) => (
          <AudioListItem value={bitrate} key={bitrate} />
        ))}
      </select>
    </div>
  );
}

function AudioListItem({ value }: BitrateProp) {
  return <option value={value}>{value}</option>;
}

export default AudioSettings;
