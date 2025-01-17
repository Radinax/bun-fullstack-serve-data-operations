import { hc } from "hono/client";
import type { AppType } from ".";
import useSWR from "swr";
import { useRef } from "react";

import "./app.css";

const client = hc<AppType>("/");

export default function App() {
  const { data: todos = [], mutate } = useSWR(["todos"], async () => {
    const response = await client.api.todos.$get();
    return response.json();
  });

  const inputRef = useRef<HTMLInputElement>(null);

  async function addTodo(): Promise<void> {
    const input = inputRef.current;
    if (!input || !input.value.trim().length) return;
    const title = input.value;
    input.value = "";

    const newTodo: (typeof todos)[number] = {
      completed: false,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      title,
    };

    const optimisticData = [newTodo, ...todos];

    mutate(
      async () => {
        const todo = await client.api.todos
          .$post({ json: { title } })
          .then((r) => r.json());
        return [todo, ...todos];
      },
      {
        optimisticData,
      }
    );
  }

  async function toggleTodo(id: string, completed: boolean): Promise<void> {
    const optimisticData = todos.map((todo) =>
      todo.id === id ? { ...todo, completed } : todo
    );
    mutate(
      async () => {
        const newTodo = await client.api.todos[":id"]
          .$patch({ param: { id }, json: { completed } })
          .then((r) => r.json());
        return todos.map((todo) => (todo.id === newTodo.id ? newTodo : todo));
      },
      {
        optimisticData,
      }
    );
  }

  async function removeTodo(id: string): Promise<void> {
    const optimisticData = todos.filter((todo) => todo.id !== id);
    mutate(
      async () => {
        await client.api.todos[":id"].$delete({ param: { id } });
        return optimisticData;
      },
      {
        optimisticData,
      }
    );
  }

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          addTodo();
        }}
      >
        <input type="text" ref={inputRef} />
        <button type="submit">Create</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              defaultChecked={todo.completed}
              onChange={(e) => toggleTodo(todo.id, e.target.checked)}
            />
            <span>{todo.title}</span>
            <button type="button" onClick={() => removeTodo(todo.id)}>
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
