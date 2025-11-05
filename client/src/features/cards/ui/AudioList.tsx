import type { FormatOption } from './ConvertToList';

const audioGroups: FormatOption[] = [
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
];

function AudioList() {
  return (
    <>
      {audioGroups.map((option: FormatOption) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </>
  );
}

export default AudioList;
