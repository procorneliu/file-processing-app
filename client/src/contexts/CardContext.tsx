/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

export type Card = {
  id: number;
  title: string;
  body: string;
  type?: string;
};

export type CardContextType = {
  activeCard: Card | null;
  setActiveCard: Dispatch<SetStateAction<Card | null>>;
};

const CardContext = createContext<CardContextType | undefined>(undefined);

function CardProvider({ children }: { children: ReactNode }) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  return (
    <CardContext.Provider value={{ activeCard, setActiveCard }}>
      {children}
    </CardContext.Provider>
  );
}

function useCard() {
  const context = useContext(CardContext);
  if (!context) throw new Error('CardContext was used outside CardProvider');
  return context;
}

export { CardProvider, useCard };
