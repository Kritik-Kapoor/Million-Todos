import { create } from "zustand";
import type { Todo } from "@/types/todo";

type TodoStore = {
  byId: Record<string, Todo>;
  allIds: string[];
  completedCount: number;
  addTodoBatch: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  replaceTodo: (tempId: string, todo: Todo) => void;
  removeTodo: (id: string) => void;
  updateTodo: (id: string, changes: Partial<Todo>) => void;
  incrementSubtaskCount: (id: string, value: number) => void;
};

export const useTodoStore = create<TodoStore>()((set) => ({
  byId: {},
  allIds: [],
  completedCount: 0,

  addTodoBatch: (todos) =>
    set((state) => {
      const byId = { ...state.byId };
      const allIds = [...state.allIds];
      let completedDelta = 0;

      for (const todo of todos) {
        byId[todo.id] = todo;
        allIds.push(todo.id);
        if (todo.completed) completedDelta++;
      }

      return {
        byId,
        allIds,
        completedCount: state.completedCount + completedDelta,
      };
    }),

  addTodo: (todo) =>
    set((state) => ({
      byId: { ...state.byId, [todo.id]: todo },
      allIds: [...state.allIds, todo.id],
    })),

  replaceTodo: (tempId, todo) =>
    set((state) => {
      const byId = { ...state.byId };
      delete byId[tempId];
      byId[todo.id] = todo;

      const idx = state.allIds.indexOf(tempId);
      const allIds = [...state.allIds];
      if (idx !== -1) allIds[idx] = todo.id;

      return { byId, allIds };
    }),

  removeTodo: (id) =>
    set((state) => {
      const byId = { ...state.byId };
      const wasCompleted = byId[id]?.completed;
      delete byId[id];

      const idx = state.allIds.indexOf(id);
      const allIds = [...state.allIds];
      if (idx !== -1) allIds.splice(idx, 1);

      return {
        byId,
        allIds,
        completedCount: state.completedCount - (wasCompleted ? 1 : 0),
      };
    }),

  updateTodo: (id, changes) =>
    set((state) => ({
      byId: { ...state.byId, [id]: { ...state.byId[id], ...changes } },
      completedCount:
        changes.completed !== undefined
          ? state.completedCount + (changes.completed ? 1 : -1)
          : state.completedCount,
    })),

  incrementSubtaskCount: (id, value) =>
    set((state) => ({
      byId: {
        ...state.byId,
        [id]: {
          ...state.byId[id],
          subtaskCount: Math.max(0, state.byId[id].subtaskCount + value),
        },
      },
    })),
}));
