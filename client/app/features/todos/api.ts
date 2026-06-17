import type { Todo } from "@/types/todo";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const updateTodo = async (
  todoId: string,
  data: Partial<Pick<Todo, "title" | "completed">>,
) => {
  const response = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const json = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(json?.message ?? "Failed to update todo");
  }

  const json = (await response.json()) as { data: { todo: Todo } };
  return json.data.todo;
};

export const deleteTodo = async (todoId: string) => {
  const response = await fetch(`${BASE_URL}/todos/${todoId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const json = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(json?.message ?? "Failed to delete todo");
  }
};
