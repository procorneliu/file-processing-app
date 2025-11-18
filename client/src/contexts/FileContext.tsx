/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { getFileType } from '../features/list/utils/getFileType';
import type { FileType } from '../types/file';

export type ProcessedFile = {
  url: string;
  filename: string;
} | null;

type FileContextType = {
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
  processedFile: ProcessedFile | null;
  setProcessedFile: Dispatch<SetStateAction<ProcessedFile | null>>;
  convertTo: string;
  setConvertTo: Dispatch<SetStateAction<string>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  fileType: FileType;
};

const FileContext = createContext<FileContextType>({
  file: null,
  setFile: () => {},
  processedFile: null,
  setProcessedFile: () => {},
  convertTo: '',
  setConvertTo: () => {},
  error: null,
  setError: () => {},
  fileType: null,
});

function FileProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(
    null,
  );
  const [convertTo, setConvertTo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fileType = getFileType(file?.name);

  useEffect(() => {
    return () => {
      if (processedFile?.url && typeof URL !== 'undefined') {
        URL.revokeObjectURL(processedFile.url);
      }
    };
  }, [processedFile]);

  return (
    <FileContext.Provider
      value={{
        file,
        setFile,
        processedFile,
        setProcessedFile,
        convertTo,
        setConvertTo,
        error,
        setError,
        fileType,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

function useFile() {
  const context = useContext(FileContext);
  if (context === undefined)
    throw new Error('FileContext was used outside FileProvider');
  return context;
}

export { FileProvider, useFile };
