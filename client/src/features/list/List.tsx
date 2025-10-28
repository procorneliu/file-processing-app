import { faker } from '@faker-js/faker';
import { useState } from 'react';

type ProcessItemProps = {
  children: string;
  processTitle: string;
};

type Process = {
  title: string;
  body: string;
  id: number;
};

function createRandomProcesses() {
  return {
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    body: faker.hacker.phrase(),
    id: faker.number.int(),
  };
}

function List({ query }: { query: string }) {
  const [processes] = useState(
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
    <ul className="flex flex-wrap content-end justify-center gap-5 px-10 py-2">
      {searchedProcesses.map((process: Process) => (
        <ProcessItem processTitle={process.title} key={process.id}>
          {process.body}
        </ProcessItem>
      ))}
    </ul>
  );
}

function ProcessItem({ children, processTitle }: ProcessItemProps) {
  return (
    <li className="h-35 w-55 cursor-pointer rounded-xl border border-gray-500 p-4 transition-all duration-300 hover:-translate-y-1 hover:scale-102 hover:bg-gray-900 hover:shadow-[0_0_1rem] hover:shadow-blue-500">
      <h4 className="font-bold tracking-wide">{processTitle}</h4>
      <p className="text-sm text-gray-400">{children}</p>
    </li>
  );
}

export default List;
