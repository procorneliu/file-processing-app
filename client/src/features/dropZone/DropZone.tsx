import { useCallback, useEffect } from 'react';
import {
  useDropzone,
  type DropzoneInputProps,
  type DropzoneRootProps,
} from 'react-dropzone';
import { useFile } from '../../contexts/FileContext';
import { useCard } from '../../contexts/CardContext';

type DragAndDropProps = {
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isDragActive: boolean;
};

type ChooseFileProps = { file: File | null } & Omit<
  DragAndDropProps,
  'isDragActive'
>;

function DropZone() {
  const { setActiveCard } = useCard();
  const { file, setFile } = useFile();

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

  useEffect(() => {
    setActiveCard(null);
  }, [file, setActiveCard]);

  return !file ? (
    <DragAndDropZone
      getRootProps={getRootProps}
      getInputProps={getInputProps}
      isDragActive={isDragActive}
    />
  ) : (
    <ChooseFileZone
      getRootProps={getRootProps}
      getInputProps={getInputProps}
      file={file}
    />
  );
}

function DragAndDropZone({
  getRootProps,
  getInputProps,
  isDragActive,
}: DragAndDropProps) {
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
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
    </div>
  );
}

function ChooseFileZone({
  getRootProps,
  getInputProps,
  file,
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
        <p className="text-sm text-blue-500">{formattedFilename}</p>
      </div>
    </div>
  );
}

export default DropZone;
