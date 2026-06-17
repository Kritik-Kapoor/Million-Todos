import type {
  FetchSubtasksResult,
  SubtasksResponse,
  Subtask,
} from "@/types/todo";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchSubtasks = async (
  todoId: string,
  signal?: AbortSignal,
): Promise<FetchSubtasksResult> => {
  const response = await fetch(`${BASE_URL}/todos/${todoId}/subtasks`, {
    credentials: "include",
    signal,
  });

  if (!response.ok) throw new Error("Failed to fetch subtasks");

  const json = (await response.json()) as SubtasksResponse;
  return {
    subtasks: json.data.subtasks,
    counts: json.data.counts,
  };
};

export const updateSubtask = async (
  subtaskId: string,
  data: Partial<Pick<Subtask, "title" | "completed" | "position">>,
) => {
  const response = await fetch(`${BASE_URL}/todos/subtasks/${subtaskId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const json = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(json?.message ?? "Failed to update subtask");
  }

  const json = (await response.json()) as { data: { subtask: Subtask } };
  return json.data.subtask;
};

export const createSubtask = async (todoId: string, title: string) => {
  const response = await fetch(`${BASE_URL}/todos/${todoId}/subtasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const json = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(json?.message ?? "Failed to create subtask");
  }

  const json = (await response.json()) as { data: { subtask: Subtask } };
  return json.data.subtask;
};

export const deleteSubtask = async (subtaskId: string) => {
  const response = await fetch(`${BASE_URL}/todos/subtasks/${subtaskId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    const json = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(json?.message ?? "Failed to delete subtask");
  }

  return await response.json();
};
