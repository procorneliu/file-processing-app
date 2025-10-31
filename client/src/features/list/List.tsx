import { useState, type Dispatch, type SetStateAction } from 'react';
import { useCard, type Card } from '../../contexts/CardContext';
import { useFile } from '../../contexts/FileContext';

type Process = Card & {
  type: string;
};

type ProcessItemProps = {
  active: boolean;
  onActiveCard: Dispatch<SetStateAction<Card | null>>;
  process: Process;
  children: string;
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
        <ProcessItem
          process={process}
          key={process.id}
          onActiveCard={setActiveCard}
          active={activeCard?.id === process.id}
        >
          {process.body}
        </ProcessItem>
      ))}
    </ul>
  );
}

function ProcessItem({ active, onActiveCard, process }: ProcessItemProps) {
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

export default List;
