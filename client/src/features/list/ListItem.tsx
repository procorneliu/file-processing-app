import type { Dispatch, SetStateAction } from 'react';
import { useFile } from '../../contexts/FileContext';
import type { Process } from './List';
import type { Card } from '../../contexts/CardContext';

type ProcessItemProps = {
  active: boolean;
  onActiveCard: Dispatch<SetStateAction<Card | null>>;
  process: Process;
  children: string;
};

function ListItem({ active, onActiveCard, process }: ProcessItemProps) {
  const { id, title, body, type } = process;
  const { setProcessedFile } = useFile();

  function handleClick() {
    setProcessedFile(null);

    onActiveCard({
      id,
      title,
      body,
      type,
    });
  }

  return (
    <li
      className={`h-35 w-55 cursor-pointer rounded-xl border border-gray-500 p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-102 hover:shadow-[0_0_1rem] ${active ? 'bg-amber-500 hover:bg-amber-500 hover:shadow-amber-500' : 'hover:bg-gray-900 hover:shadow-blue-500'}`}
      onClick={handleClick}
    >
      <h4 className="font-bold tracking-wide">{title}</h4>
      <p className={`text-sm ${active ? 'text-gray-800' : 'text-gray-400'}`}>
        {body}
      </p>
    </li>
  );
}

export default ListItem;
