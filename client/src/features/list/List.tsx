import { useState } from 'react';
import { useCard, type Card } from '../../contexts/CardContext';
import ListItem from './ListItem';
import getCardsData from './data/getCardsData';
import { useFile } from '../../contexts/FileContext';
import { getFileType } from './utils/getFileType';

export type Process = Card & {
  allowedFormats: 'video' | 'audio' | 'image';
};

function List({ query }: { query: string }) {
  const processesList = getCardsData();

  const { file } = useFile();
  const { activeCard, setActiveCard } = useCard();
  const [processes] = useState<Process[]>(processesList);

  // display only allowed card types file uploaded file format
  const allowedType = getFileType(file?.name);
  const allowedProcesses = allowedType
    ? processes.filter((process) => process.allowedFormats === allowedType)
    : processes;

  // filter card by search input
  const searchedProcesses =
    query.length > 0
      ? allowedProcesses.filter((process) =>
          `${process.title} ${process.body}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
      : allowedProcesses;

  return (
    <ul className="flex flex-wrap justify-center gap-5 py-2">
      {searchedProcesses.map((process: Process) => (
        <ListItem
          process={process}
          key={process.id}
          onActiveCard={setActiveCard}
          active={activeCard?.id === process.id}
        >
          {process.body}
        </ListItem>
      ))}
    </ul>
  );
}

export default List;
