import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

type ProcessingModeContextType = {
  generateDownloadLink: boolean;
  setGenerateDownloadLink: Dispatch<SetStateAction<boolean>>;
};

const ProcessingModeContext = createContext<
  ProcessingModeContextType | undefined
>(undefined);

function ProcessingModeProvider({ children }: { children: ReactNode }) {
  const [generateDownloadLink, setGenerateDownloadLink] = useState(false);

  return (
    <ProcessingModeContext.Provider
      value={{ generateDownloadLink, setGenerateDownloadLink }}
    >
      {children}
    </ProcessingModeContext.Provider>
  );
}

function useProcessingMode() {
  const context = useContext(ProcessingModeContext);
  if (!context)
    throw new Error('ProcessingModeContext used outside its provider');
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export { ProcessingModeProvider, useProcessingMode };
