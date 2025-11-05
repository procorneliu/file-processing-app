import { useFile } from '../../../contexts/FileContext';

type FormatOption = { value: string; label: string };

type FormatGroup = {
  label: string;
  options: FormatOption[];
};

type ConvertToProps = {
  fileExtension: string | undefined;
};

const formatGroups: FormatGroup[] = [
  {
    label: 'Video containers',
    options: [
      {
        value: 'mp4',
        label: '.mp4',
      },
      { value: 'mkv', label: '.mkv' },
      { value: 'mov', label: '.mov' },
      { value: 'avi', label: '.avi' },
      { value: 'flv', label: '.flv' },
      { value: 'webm', label: '.webm' },
      { value: 'ts', label: '.ts' },
      { value: 'm2ts', label: '.m2ts' },
      { value: '3gp', label: '.3gp' },
      { value: 'ogv', label: '.ogv' },
      { value: 'gif', label: '.gif' },
      { value: 'mxf', label: '.mxf' },
      { value: 'vob', label: '.vob' },
      { value: 'mpg', label: '.mpg' },
      { value: 'wmv', label: '.wmv' },
      { value: 'f4v', label: '.f4v' },
      { value: 'yuv', label: '.yuv' },
      { value: 'mjpeg', label: '.mjpeg' },
      { value: 'nut', label: '.nut' },
    ],
  },
  {
    label: 'Audio-only containers',
    options: [
      { value: 'mp3', label: '.mp3' },
      { value: 'wav', label: '.wav' },
      { value: 'aac', label: '.aac' },
      { value: 'flac', label: '.flac' },
      { value: 'ogg', label: '.ogg' },
      { value: 'm4a', label: '.m4a' },
      { value: 'opus', label: '.opus' },
      { value: 'alac', label: '.alac' },
      { value: 'wma', label: '.wma' },
      { value: 'amr', label: '.amr' },
      { value: 'aiff', label: '.aiff' },
      { value: 'au', label: '.au' },
      { value: 'ac3', label: '.ac3' },
      { value: 'dts', label: '.dts' },
      { value: 'mp2', label: '.mp2' },
      { value: 'spx', label: '.spx' },
    ],
  },
  {
    label: 'Image / frame sequences',
    options: [
      { value: 'png', label: '.png' },
      { value: 'jpg', label: '.jpg' },
      { value: 'jpeg', label: '.jpeg' },
      { value: 'bmp', label: '.bmp' },
      { value: 'tiff', label: '.tiff' },
      { value: 'webp', label: '.webp' },
      { value: 'avif', label: '.avif' },
      { value: 'jp2', label: '.jp2' },
      { value: 'exr', label: '.exr' },
      { value: 'tga', label: '.tga' },
    ],
  },
];

function ConvertToSettings({ fileExtension }: ConvertToProps) {
  const { convertTo, setConvertTo } = useFile();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setConvertTo(e.target.value);
  }

  return (
    <div className="flex justify-center space-x-2 pb-2">
      <p>From</p>
      <span className="text-blue-500">{fileExtension}</span>
      <label htmlFor="format ">To</label>
      <select
        name="to"
        id="format"
        value={convertTo}
        onChange={handleChange}
        className="rounded-md border"
      >
        {formatGroups.map((group: FormatGroup) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option: FormatOption) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

export default ConvertToSettings;
