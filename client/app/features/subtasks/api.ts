import { apiFetch } from "@/lib/utils/apiClient";
import type { Subtask, SubtasksResponse } from "@/types/todo";

export const fetchSubtasks = (
  todoId: string,
  signal?: AbortSignal,
): Promise<SubtasksResponse["data"]> =>
  apiFetch<SubtasksResponse["data"]>(`/todos/${todoId}/subtasks`, {
    signal,
    fallbackErrorMessage: "Failed to fetch subtasks",
  });

export const updateSubtask = (
  subtaskId: string,
  data: Partial<Pick<Subtask, "title" | "completed" | "position">>,
) =>
  apiFetch<{ subtask: Subtask }>(`/todos/subtasks/${subtaskId}`, {
    method: "POST",
    body: data,
    fallbackErrorMessage: "Failed to update subtask",
  }).then(({ subtask }) => subtask);

export const createSubtask = (todoId: string, title: string) =>
  apiFetch<{ subtask: Subtask }>(`/todos/${todoId}/subtasks`, {
    method: "POST",
    body: { title },
    fallbackErrorMessage: "Failed to create subtask",
  }).then(({ subtask }) => subtask);

export const deleteSubtask = (subtaskId: string) =>
  apiFetch<null>(`/todos/subtasks/${subtaskId}`, {
    method: "DELETE",
    fallbackErrorMessage: "Failed to delete subtask",
    responseType: "envelope",
  });
