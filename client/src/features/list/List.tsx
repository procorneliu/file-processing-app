import { useState } from 'react';
import { useCard, type Card } from '../../contexts/CardContext';
import ListItem from './ListItem';
import axios from 'axios';
import { API_BASE } from '../../hooks/useProcessingJob';
import getCardsData from './helpers/getCardsData';

export type Process = Card & {
  type: string;
};

function List({ query }: { query: string }) {
  const processesList = getCardsData();

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

async function getCards() {
  return await axios.get(`${API_BASE}/cards`);
}

export default List;
