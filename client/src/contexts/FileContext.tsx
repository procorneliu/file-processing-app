/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

export type ProcessedFile = {
  url: string;
  filename: string;
} | null;

type FileContextType = {
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
  processedFile: ProcessedFile;
  setProcessedFile: Dispatch<SetStateAction<ProcessedFile>>;
};

const FileContext = createContext<FileContextType>({
  file: null,
  setFile: () => {},
  processedFile: null,
  setProcessedFile: () => {},
});

function FileProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<ProcessedFile>(null);

  useEffect(() => {
    return () => {
      if (processedFile?.url && typeof URL !== 'undefined') {
        URL.revokeObjectURL(processedFile.url);
      }
    };
  }, [processedFile]);

  return (
    <FileContext.Provider
      value={{ file, setFile, processedFile, setProcessedFile }}
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
