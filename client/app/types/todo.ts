import type { ApiResponse } from "./api";

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
  position: number;
};

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  subtaskCount: number;
  dueDate?: string | null;
};

export type SubtaskCounts = {
  all: number;
  completed: number;
  pending: number;
};

export type SubtasksResponse = ApiResponse<{
  subtasks: Subtask[];
  counts: SubtaskCounts;
}>;
