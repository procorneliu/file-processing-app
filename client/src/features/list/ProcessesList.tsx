import { useRef, useState } from 'react';
import useGlobalShorcut from '../../hooks/GlobalShorcut';
import List from './List';
import SearchBar from './SearchBar';
import { useFile } from '../../contexts/FileContext';
import CardSettings from './CardSettings';
import { useCard } from '../../contexts/CardContext';

function ProcessesList() {
  const { file } = useFile();
  const { activeCard } = useCard();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');

  useGlobalShorcut(() => {
    if (inputRef.current) inputRef.current.focus();
  });

  return (
    <div className="mt-50 flex w-[85%] flex-col items-center justify-center space-y-4 text-stone-100">
      <h2 className="text-xl">Choose what you want to do with...</h2>
      <p className="text-sm text-blue-500">[ {file?.name} ]</p>

      {activeCard && <CardSettings />}
      <SearchBar ref={inputRef} query={query} onQuery={setQuery} />
      <List query={query} />
    </div>
  );
}

export default ProcessesList;
