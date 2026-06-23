import { apiFetch } from "@/lib/utils/apiClient";
import type { Todo } from "@/types/todo";

export const updateTodo = (
  todoId: string,
  data: Partial<Pick<Todo, "title" | "completed">>,
) =>
  apiFetch<{ todo: Todo }>(`/todos/${todoId}`, {
    method: "POST",
    body: data,
    fallbackErrorMessage: "Failed to update todo",
  }).then(({ todo }) => todo);

export const deleteTodo = (todoId: string) =>
  apiFetch<null>(`/todos/${todoId}`, {
    method: "DELETE",
    fallbackErrorMessage: "Failed to delete todo",
  });
