import getFormats from '../../../data/getFormats';

type FormatsListProp = {
  format: string;
};

function FormatsList({ format }: FormatsListProp) {
  const formats = getFormats(format);
  return (
    <>
      {formats.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </>
  );
}

export default FormatsList;
