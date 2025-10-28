import { useFile } from '../contexts/FileContext';

import DropZone from '../features/dropZone/DropZone';
import ProcessesList from '../features/list/ProcessesList';
import MainContainer from '../ui/MainContainer';

function FileEditor() {
  const { file } = useFile();

  return (
    <MainContainer>{!file ? <DropZone /> : <ProcessesList />}</MainContainer>
  );
}

export default FileEditor;
