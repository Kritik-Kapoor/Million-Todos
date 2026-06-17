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
};

export type SubtaskCounts = {
  all: number;
  completed: number;
  pending: number;
};

export type SubtasksResponse = {
  status: string;
  data: {
    subtasks: Subtask[];
    counts: SubtaskCounts;
  };
};

export type FetchSubtasksResult = {
  subtasks: Subtask[];
  counts: SubtaskCounts;
};
