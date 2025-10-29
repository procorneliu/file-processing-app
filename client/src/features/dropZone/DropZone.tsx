import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFile } from '../../contexts/FileContext';

function DropZone() {
  const { setFile } = useFile();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const nextFile = acceptedFiles[0] ?? null;
      setFile(nextFile);
    },
    [setFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  return (
    <div className="my-auto">
      <div
        {...getRootProps()}
        className="flex h-80 w-lg cursor-copy items-center justify-center rounded-xl border-3 border-dashed text-center text-stone-50 hover:bg-gray-900"
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
    </div>
  );
}

export default DropZone;
