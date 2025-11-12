import { useCallback, useEffect } from 'react';
import {
  useDropzone,
  type DropzoneInputProps,
  type DropzoneRootProps,
} from 'react-dropzone';
import { useFile } from '../../contexts/FileContext';
import { useCard } from '../../contexts/CardContext';
import getFormats from '../../data/getFormats';
import { getFileExtension } from '../../utils/getFileExtension';

type DragAndDropProps = {
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isDragActive: boolean;
  error: string | null;
};

type ChooseFileProps = { file: File | null } & Omit<
  DragAndDropProps,
  'isDragActive'
>;

function DropZone() {
  const { setActiveCard } = useCard();
  const { file, setFile, error, setError } = useFile();
  const allFormats = getFormats('all');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const nextFile = acceptedFiles[0] ?? null;
      if (!nextFile)
        return setError(
          'Something went wrong with file uploading. Please try another one!',
        );

      // limit upload file size.
      const limitSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (nextFile.size > limitSize) {
        return setError('File size is too big. Limit is 2GB!');
      }

      const fileFormat = nextFile && getFileExtension(nextFile.name);
      // check if uploaded file format is supported
      const isExtensionAllowed = fileFormat
        ? allFormats.includes(fileFormat)
        : false;

      if (!isExtensionAllowed) {
        setError('File format not supported!');
        setFile(null);
        return;
      }
      setFile(nextFile);
      setError(null);
    },
    [setError, allFormats, setFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  useEffect(() => {
    setActiveCard(null);
  }, [file, setActiveCard]);

  useEffect(() => {
    if (error) setFile(null);
  }, [error, setFile]);

  return !file ? (
    <DragAndDropZone
      getRootProps={getRootProps}
      getInputProps={getInputProps}
      isDragActive={isDragActive}
      error={error}
    />
  ) : (
    <ChooseFileZone
      getRootProps={getRootProps}
      getInputProps={getInputProps}
      file={file}
      error={error}
    />
  );
}

function DragAndDropZone({
  getRootProps,
  getInputProps,
  isDragActive,
  error,
}: DragAndDropProps) {
  const message = error
    ? error
    : 'Drag "n" drop some files here, or click to select files';

  return (
    <div className="my-auto" title="Choose a file">
      <div
        {...getRootProps()}
        className="flex h-80 w-lg cursor-copy items-center justify-center rounded-xl border-3 border-dashed text-center text-stone-50 hover:bg-gray-900"
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p className={error ? 'text-red-500' : ''}>{message}</p>
        )}
      </div>
    </div>
  );
}

function ChooseFileZone({
  getRootProps,
  getInputProps,
  file,
  error,
}: ChooseFileProps) {
  const extension = file?.name.split('.')[1];
  // if file name is white space, replace with 'file'
  const filename = file?.name.split('.')[0].trim()
    ? file?.name.split('.')[0]
    : `file`;
  const formattedFilename =
    filename.length > 35
      ? `${filename.slice(0, 35)}....${extension}`
      : `${filename}.${extension}`;

  return (
    <div className="my-auto">
      <div
        {...getRootProps()}
        title="Choose another file"
        className="mb-1.5 cursor-pointer rounded-lg border-2 border-dashed px-3 py-1 hover:bg-gray-900"
      >
        <input {...getInputProps()} />
        <p className={`text-sm ${error ? 'text-red-500' : 'text-blue-500'}`}>
          {!error ? formattedFilename : error}
        </p>
      </div>
    </div>
  );
}

export default DropZone;
