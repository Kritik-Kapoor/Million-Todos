import { apiFetch } from "@/lib/utils/apiClient";
import type { Todo } from "@/types/todo";

export const createTodo = (data: {
  title: string;
  labels?: string[];
  dueDate?: Date;
}) =>
  apiFetch<Todo>("/todos", {
    method: "POST",
    body: data,
    fallbackErrorMessage: "Failed to create todo",
  });

export const updateTodo = (
  todoId: string,
  data: Partial<Pick<Todo, "title" | "completed">>,
) =>
  apiFetch<Todo>(`/todos/${todoId}`, {
    method: "POST",
    body: data,
    fallbackErrorMessage: "Failed to update todo",
  });

export const deleteTodo = (todoId: string) =>
  apiFetch<null>(`/todos/${todoId}`, {
    method: "DELETE",
    fallbackErrorMessage: "Failed to delete todo",
  });
