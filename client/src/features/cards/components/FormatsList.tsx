import { memo, useEffect, useRef } from 'react';
import { useFile } from '../../../contexts/FileContext';
import getFormats from '../../../data/getFormats';
import { getFileExtension } from '../../../utils/getFileExtension';

type FormatsListProp = {
  format: string;
};

function FormatsList({ format }: FormatsListProp) {
  const { file, setConvertTo } = useFile();
  const fileExtension = getFileExtension(file?.name);

  // Getting all formats by type
  const formats = getFormats(format);
  // Excluding same format, e.g. if file is mp4, exlude mp4 from list
  const safeFormats = formats.filter((format) => format !== fileExtension);

  const isInitial = useRef(true);

  // Assign convertTo value to first element from card settings list
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      setConvertTo(safeFormats[0]);
    }
  }, [setConvertTo, safeFormats]);

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
