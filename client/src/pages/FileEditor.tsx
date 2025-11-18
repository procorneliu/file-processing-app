import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFile } from '../contexts/FileContext';
import { useProcessingMode } from '../contexts/ProcessingModeContext';

import DropZone from '../features/dropZone/DropZone';
import ProcessesList from '../features/list/ProcessesList';
import MainContainer from '../ui/MainContainer';

function FileEditor() {
  const { file } = useFile();
  const { hasChosenMode } = useProcessingMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasChosenMode) {
      navigate('/', { replace: true });
    }
  }, [hasChosenMode, navigate]);

  if (!hasChosenMode) {
    return null;
  }

  return (
    <MainContainer>{!file ? <DropZone /> : <ProcessesList />}</MainContainer>
  );
}

export default FileEditor;
