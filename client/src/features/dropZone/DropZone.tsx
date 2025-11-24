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
import { useSubscription } from '../../hooks/useSubscription';

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
  const { isPro } = useSubscription();
  const allFormats = getFormats('all');

  const getVideoDuration = useCallback((file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video metadata'));
      };

      video.src = URL.createObjectURL(file);
    });
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const nextFile = acceptedFiles[0] ?? null;
      if (!nextFile)
        return setError(
          'Something went wrong with file uploading. Please try another one!',
        );

      // Check file size based on subscription
      const maxFileSizeBytes = isPro
        ? 10 * 1024 * 1024 * 1024 // 10GB
        : 1 * 1024 * 1024 * 1024; // 1GB

      if (nextFile.size > maxFileSizeBytes) {
        const maxSizeGB = isPro ? '10GB' : '1GB';
        return setError(
          `File size is too big. Maximum file size for ${isPro ? 'Pro' : 'Free'} plan is ${maxSizeGB}.`,
        );
      }

      const fileFormat = (
        nextFile && getFileExtension(nextFile.name)
      )?.toLowerCase();
      // check if uploaded file format is supported
      const isExtensionAllowed = fileFormat
        ? allFormats.includes(fileFormat)
        : false;

      if (!isExtensionAllowed) {
        setError('File format not supported!');
        setFile(null);
        return;
      }

      // Check video duration for video files
      const videoFormats = getFormats('video');
      if (fileFormat && videoFormats.includes(fileFormat)) {
        try {
          const duration = await getVideoDuration(nextFile);
          const maxDurationSeconds = isPro ? 60 * 60 : 5 * 60; // 60 min pro, 5 min free
          const maxDurationMinutes = Math.floor(maxDurationSeconds / 60);

          if (duration > maxDurationSeconds) {
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            return setError(
              `Video length is too long. Maximum video length for ${isPro ? 'Pro' : 'Free'} plan is ${maxDurationMinutes} minutes. Your video is ${minutes}m ${seconds}s.`,
            );
          }
        } catch {
          // If we can't get duration, continue (server will validate)
        }
      }

      setFile(nextFile);
      setError(null);
    },
    [setError, allFormats, setFile, isPro, getVideoDuration],
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
