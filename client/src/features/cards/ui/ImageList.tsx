import type { FormatOption } from './ConvertToList';

const imageGroups: FormatOption[] = [
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
];

function ImageList() {
  return (
    <>
      {imageGroups.map((option: FormatOption) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </>
  );
}

export default ImageList;
