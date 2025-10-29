import { faker } from '@faker-js/faker';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { useCard, type Card } from '../../contexts/CardContext';

type ProcessItemProps = {
  children: string;
  processTitle: string;
  active: boolean;
  onActiveCard: Dispatch<SetStateAction<Card | null>>;
  id: number;
};

type Process = Card;

function createRandomProcesses(): Process {
  return {
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    body: faker.hacker.phrase(),
    id: faker.number.int(),
  };
}

function List({ query }: { query: string }) {
  const { activeCard, setActiveCard } = useCard();
  const [processes] = useState<Process[]>(() =>
    Array.from({ length: 21 }, () => createRandomProcesses()),
  );

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
          processTitle={process.title}
          id={process.id}
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

function ProcessItem({
  children,
  processTitle,
  active,
  id,
  onActiveCard,
}: ProcessItemProps) {
  return (
    <li
      className={`h-35 w-55 cursor-pointer rounded-xl border border-gray-500 p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-102 hover:shadow-[0_0_1rem] ${active ? 'bg-amber-500 hover:bg-amber-500 hover:shadow-amber-500' : 'hover:bg-gray-900 hover:shadow-blue-500'}`}
      onClick={() => {
        onActiveCard({
          id,
          title: processTitle,
          body: children,
        });
      }}
    >
      <h4 className="font-bold tracking-wide">{processTitle}</h4>
      <p className={`text-sm ${active ? 'text-gray-800' : 'text-gray-400'}`}>
        {children}
      </p>
    </li>
  );
}

export default List;
