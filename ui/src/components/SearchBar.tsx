import { Accessor, createEffect, createSignal } from 'solid-js';
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
    <div class="relative rounded-full overflow-hidden">
      <input
        type="text"
        value={unsubmittedSearchTerm()}
        onInput={handleUnsubmittedSearchTermChange}
        placeholder="Search..."
        class="input border-solid border-4 border-neutral pl-12 pr-3 py-7 w-64 bg-base-100 rounded-full shadow-md focus:outline-none focus:ring focus:ring-blue-300"
      />
      <div class="absolute inset-y-0 left-3 flex items-center pr-3 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
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
      </div>
    </div>
  );
}
