import { createSignal } from 'solid-js';

interface SearchBarProps {
  setSearchTerm: Function;
}

export default function SearchBar({ setSearchTerm }: SearchBarProps) {
  const [unsubmittedSearchTerm, setUnsubmittedSearchTerm] =
    createSignal<string>('');

  const handleSearchSubmit = () => {
    setSearchTerm(unsubmittedSearchTerm());
  };

  return (
    <div class="join">
      <div>
        <div>
          <input
            class="input input-bordered join-item w-96"
            placeholder="Search..."
            value={unsubmittedSearchTerm()}
            onChange={(e) => setUnsubmittedSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div class="indicator">
        <button
          class="btn join-item"
          onClick={handleSearchSubmit}
        >
          Search
        </button>
      </div>
    </div>
  );
}
