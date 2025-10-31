import { useState } from 'react';
import { useCard, type Card } from '../../contexts/CardContext';
import ListItem from './ListItem';

export type Process = Card & {
  type: string;
};

const processesList = [
  {
    id: 1,
    title: 'MP4 to PNG',
    body: 'Convert all your video frames to png images',
    type: 'mp4_png',
  },
  {
    id: 2,
    title: 'MP4 to MP3',
    body: 'Get only audio channel from your video.',
    type: 'mp4_mp3',
  },
];

function List({ query }: { query: string }) {
  const { activeCard, setActiveCard } = useCard();
  const [processes] = useState<Process[]>(processesList);

  const searchedProcesses =
    query.length > 0
      ? processes.filter((process) =>
          `${process.title} ${process.body}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
      : processes;

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
