import { useRef, useState } from 'react';

import useGlobalShorcut from '../../hooks/useGlobalShorcut';
import List from './List';
import SearchBar from './SearchBar';
import DropZone from '../dropZone/DropZone';
import CardSettings from '../cards/CardSettings';
import { useCard } from '../../contexts/CardContext';

function ProcessesList() {
  const { activeCard } = useCard();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');

  useGlobalShorcut(() => {
    if (inputRef.current) inputRef.current.focus();
  });

  return (
    <div className="mt-50 flex w-[85%] flex-col items-center justify-center space-y-4 text-stone-100">
      <h2 className="text-xl">Choose what you want to do with...</h2>
      <DropZone />
      {activeCard && <CardSettings />}
      <SearchBar ref={inputRef} query={query} onQuery={setQuery} />
      <List query={query} />
    </div>
  );
}

export default ProcessesList;
