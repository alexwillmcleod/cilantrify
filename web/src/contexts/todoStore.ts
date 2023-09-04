import { atom } from 'nanostores';

export const todoList = atom<string[]>([]);

export const addTodo = (value: string) => {
  todoList.set([...todoList.get(), value]);
};

export const deleteTodo = (index: number) => {
  todoList.set(todoList.get().filter((_, i) => index != i));
};
