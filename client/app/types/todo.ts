import type { ApiResponse } from "./api";

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
  position: number;
};

export type TodoLabel = {
  id: string;
  name: string;
  color: string;
};

export type Todo = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  subtaskCount: number;
  dueDate?: string | null;
  labels?: TodoLabel[];
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

export type TodoMetaDataChangeDataParams = {
  id: string;
  updateFields: keyof Partial<Todo>;
  data: Partial<{
    title?: string;
    dueDate?: Date | null;
    labels?: string[];
    description?: string;
  }>;
};
