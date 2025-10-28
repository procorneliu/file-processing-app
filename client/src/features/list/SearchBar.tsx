import { useState, type Dispatch, type Ref, type SetStateAction } from 'react';
import { LuSearch, LuCommand } from 'react-icons/lu';

type SearchBarProps = {
  ref: Ref<HTMLInputElement>;
  query: string;
  onQuery: Dispatch<SetStateAction<string>>;
};

function SearchBar({ ref, query, onQuery }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(true);

  return (
    <div className="relative mb-8 text-stone-400">
      <span className="pointer-events-none absolute inset-y-0 flex items-center pl-3.5 font-light">
        <LuSearch />
      </span>
      <input
        type="text"
        placeholder="Search processes..."
        className="focus: w-70 rounded-xl border border-stone-500 px-10 py-2 text-stone-100 transition-all duration-300 outline-none placeholder:text-stone-400 focus:w-100 focus:ring focus:ring-blue-400"
        ref={ref}
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        onFocus={() => setIsFocused(false)}
        onBlur={() => setIsFocused(true)}
      />

      {isFocused && (
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center space-x-1 pr-3.5 font-light">
          <LuCommand />
          <span>K</span>
        </span>
      )}
    </div>
  );
}

export default SearchBar;
