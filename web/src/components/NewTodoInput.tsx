import { addTodo } from '../contexts/todoStore';
import { createSignal } from 'solid-js';

export default function NewTodoInput() {
  const [newTodoInputValue, setNewTodoInputValue] = createSignal('');

  const handleNewTodoInputValueChange = (e: any) => {
    setNewTodoInputValue(e.target.value);
  };

  const handleNewTodoSubmit = () => {
    if (newTodoInputValue() == '') return;
    addTodo(newTodoInputValue());
    setNewTodoInputValue('');
  };

  const handleKeyPress = (e: any) => {
    handleNewTodoInputValueChange(e);
    if (e.keyCode === 13) {
      handleNewTodoSubmit();
      e.preventDefault();
    }
  };

  return (
    <div class="flex flex-row gap-4">
      <input
        class="border border-2 border-black rounded-xl p-2"
        value={newTodoInputValue()}
        onKeyPress={handleKeyPress}
      />
      <button
        class="bg-green-100 p-4 rounded-xl"
        onClick={handleNewTodoSubmit}
      >
        Add
      </button>
    </div>
  );
}
