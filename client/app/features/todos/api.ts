import { apiFetch } from "@/lib/utils/apiClient";
import type { Todo } from "@/types/todo";

export type DueDateFilter = "today" | "upcoming_week" | "past_week" | "overdue";

export type TodoFilters = {
  search?: string;
  labelIds?: string[];
  dueDate?: DueDateFilter;
};

export type UpdateTodoPayload = Partial<Pick<Todo, "title" | "completed">> & {
  labels?: string[];
  dueDate?: Date | null;
};

export function buildFilterParams(filters: TodoFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  filters.labelIds?.forEach((id) => params.append("labelIds", id));
  if (filters.dueDate) params.set("dueDate", filters.dueDate);
  return params;
}

export function hasActiveFilters(filters: TodoFilters): boolean {
  return !!(
    filters.search?.trim() ||
    (filters.labelIds && filters.labelIds.length > 0) ||
    filters.dueDate
  );
}

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

export const updateTodo = (todoId: string, data: UpdateTodoPayload) =>
  apiFetch<Todo>(`/todos/${todoId}`, {
    method: "PATCH",
    body: data,
    fallbackErrorMessage: "Failed to update todo",
  });

export const deleteTodo = (todoId: string) =>
  apiFetch<null>(`/todos/${todoId}`, {
    method: "DELETE",
    fallbackErrorMessage: "Failed to delete todo",
  });
