import { Accessor, createEffect, createSignal, onMount } from 'solid-js';
import SearchIcon from '/search-icon.svg';
import { debounce } from 'lodash';

interface SearchBarProps {
  setSearchTerm: Function;
  searchTerm: Accessor<string>;
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
}: SearchBarProps) {
  const [unsubmittedSearchTerm, setUnsubmittedSearchTerm] =
    createSignal<string>('');

  createEffect(() => {
    setUnsubmittedSearchTerm(searchTerm());
  });

  const handleSearchSubmit = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const debouncedSearchSubmit = debounce((searchTerm: string) => {
    handleSearchSubmit(searchTerm);
  }, 500);

  const handleUnsubmittedSearchTermChange = (e: any) => {
    setUnsubmittedSearchTerm(e.target.value);
    debouncedSearchSubmit(unsubmittedSearchTerm());
  };

  // return (
  //   <input
  //     class="input input-bordered join-item w-96"
  //     placeholder="Search..."
  //     value={unsubmittedSearchTerm()}
  //     onChange={(e) => setUnsubmittedSearchTerm(e.target.value)}
  //     onBlur={handleSearchSubmit}
  //   />
  // );

  return (
    <div class="md:input-group">
      <input
        type="search"
        class="input input-bordered md:join-item w-96"
        name="search"
        value={unsubmittedSearchTerm()}
        onInput={handleUnsubmittedSearchTermChange}
        placeholder="Search for something tasty..."
      />
      <button
        onClick={() => handleSearchSubmit(unsubmittedSearchTerm())}
        class="md:btn md:btn-square md:cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="cursor-pointer h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </div>
  );
}
