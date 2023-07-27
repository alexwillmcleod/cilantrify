import { createContext, Accessor, createSignal, useContext } from 'solid-js';

const SearchContext = createContext<{
  searchTerm: Accessor<string>;
  setSearchTerm: (newSearchTerm: string) => void;
}>();

export const SearchProvider = (props: any) => {
  const [searchTerm, setSearchTerm] = createSignal<string>('');
  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
      }}
    >
      {props.children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
