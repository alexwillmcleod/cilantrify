import { createSignal } from 'solid-js';
import SearchIcon from '/search-icon.svg';

interface SearchBarProps {
  setSearchTerm: Function;
}

export default function SearchBar({ setSearchTerm }: SearchBarProps) {
  const [unsubmittedSearchTerm, setUnsubmittedSearchTerm] =
    createSignal<string>('');

  const handleSearchSubmit = () => {
    setSearchTerm(unsubmittedSearchTerm());
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
    <div class="relative">
      <input
        type="search"
        class="input input-bordered join-item w-96"
        name="search"
        value={unsubmittedSearchTerm()}
        onChange={(e) => setUnsubmittedSearchTerm(e.target.value)}
        onBlur={handleSearchSubmit}
        placeholder="Search..."
      />
      <button
        onClick={handleSearchSubmit}
        class="btn btn-ghost absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <img src={SearchIcon} />
      </button>
    </div>
  );
}
