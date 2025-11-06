import { useFile } from '../../../contexts/FileContext';
import getFormats from '../../../data/getFormats';

type FormatsListProp = {
  format: string;
};

function FormatsList({ format }: FormatsListProp) {
  const { file } = useFile();
  const fileExtension = file?.name.split('.').pop();

  // Getting all formats by type
  const formats = getFormats(format);
  // Excluding same format, e.g. if file is mp4, exlude mp4 from list
  const safeFormats = formats.filter((format) => format !== fileExtension);

  return (
    <>
      {safeFormats.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </>
  );
}

export default FormatsList;
