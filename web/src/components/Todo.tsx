import { deleteTodo } from '../contexts/todoStore';

interface TodoProps {
  value: string;
  index: number;
}

export default function Todo({ value, index }: TodoProps) {
  return (
    <span class="flex flex-row justify-center items-center p-4 bg-slate-50 rounded-lg gap-4">
      {value}
      <button
        onClick={() => deleteTodo(index)}
        class="p-2 bg-red-100 rounded-md"
      >
        Delete
      </button>
    </span>
  );
}
