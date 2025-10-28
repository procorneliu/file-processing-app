/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

type FileContextType = {
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
};

const FileContext = createContext<FileContextType>({
  file: null,
  setFile: () => {},
});

function FileProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <FileContext.Provider value={{ file, setFile }}>
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
