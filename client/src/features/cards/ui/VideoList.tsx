import type { FormatOption } from './ConvertToList';

const videoGroups: FormatOption[] = [
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
];

function VideoList() {
  return (
    <>
      {videoGroups.map((option: FormatOption) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </>
  );
}

export default VideoList;
