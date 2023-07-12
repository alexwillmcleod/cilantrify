import { Accessor } from 'solid-js';

interface PaginationProps {
  currentPage: Accessor<number>;
  totalPages: Accessor<number>;
  nextPage: Function;
  lastPage: Function;
}

export default function Pagination({
  currentPage,
  totalPages,
  nextPage,
  lastPage,
}: PaginationProps) {
  return (
    <div class="join w-max">
      <button
        onClick={() => lastPage()}
        class="join-item btn"
        disabled={currentPage() == 1}
      >
        «
      </button>
      <button class="join-item btn">Page {currentPage()}</button>
      <button
        onClick={() => nextPage()}
        class="join-item btn"
        disabled={currentPage() >= totalPages()}
      >
        »
      </button>
    </div>
  );
}
