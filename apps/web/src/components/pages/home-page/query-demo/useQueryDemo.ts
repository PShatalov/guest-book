'use client';

import { useQuery } from '@tanstack/react-query';

const DEMO_TODO_URL = 'https://jsonplaceholder.typicode.com/todos/1' as const;

type DemoTodo = {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
};

const isDemoTodo = (value: unknown): value is DemoTodo => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'number' &&
    typeof record.title === 'string' &&
    typeof record.completed === 'boolean' &&
    typeof record.userId === 'number'
  );
};

export const useQueryDemo = () => {
  return useQuery({
    queryKey: ['demo-todo'],
    queryFn: async ({ signal }) => {
      const response = await fetch(DEMO_TODO_URL, { signal });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data: unknown = await response.json();
      if (!isDemoTodo(data)) {
        throw new Error('Invalid demo response shape');
      }
      return data;
    },
  });
};
