import { useStore } from '@nanostores/solid';
import { For } from 'solid-js';
import { todoList, addTodo, deleteTodo } from '../contexts/todoStore';
import Todo from './Todo';

export default function TodoList() {
  const $todoList = useStore(todoList);
  return (
    <ul class="flex flex-col gap-4 list-disc">
      <For each={$todoList()}>
        {(element, index) => (
          <li>
            {
              <Todo
                index={index()}
                value={element}
              />
            }
          </li>
        )}
      </For>
    </ul>
  );
}
