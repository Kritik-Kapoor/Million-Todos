import { create } from "zustand";
import type { Todo } from "@/types/todo";

const _byId = new Map<string, Todo>();
const _allIds: string[] = [];

type TodoStore = {
  version: number;
  byId: Map<string, Todo>;
  allIds: string[];
  completedCount: number;

  resetTodos: () => void;
  addTodoBatch: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  replaceTodo: (tempId: string, todo: Todo) => void;
  removeTodo: (id: string) => void;
  updateTodo: (id: string, changes: Partial<Todo>) => void;
  incrementSubtaskCount: (id: string, value: number) => void;
};

export const useTodoStore = create<TodoStore>()((set) => ({
  version: 0,
  byId: _byId,
  allIds: _allIds,
  completedCount: 0,

  resetTodos: () => {
    _byId.clear();
    _allIds.length = 0;
    set({ version: 0, completedCount: 0 });
  },

  addTodoBatch: (todos) => {
    let addedCount = 0;
    let completedDelta = 0;

    for (const todo of todos) {
      const existing = _byId.get(todo.id);

      if (existing) {
        if (existing.completed !== todo.completed) {
          completedDelta += todo.completed ? 1 : -1;
        }
        _byId.set(todo.id, todo);
        continue;
      }

      _byId.set(todo.id, todo);
      _allIds.push(todo.id);
      addedCount++;
      if (todo.completed) completedDelta++;
    }

    if (addedCount === 0 && completedDelta === 0) return;

    set((state) => ({
      version: state.version + 1,
      completedCount: state.completedCount + completedDelta,
    }));
  },

  addTodo: (todo) => {
    if (_byId.has(todo.id)) return;

    _byId.set(todo.id, todo);
    _allIds.push(todo.id);
    set((state) => ({
      version: state.version + 1,
      completedCount: state.completedCount + (todo.completed ? 1 : 0),
    }));
  },

  replaceTodo: (tempId, todo) => {
    _byId.delete(tempId);
    _byId.set(todo.id, todo);
    const idx = _allIds.indexOf(tempId);
    if (idx !== -1) _allIds[idx] = todo.id;
    set((state) => ({ version: state.version + 1 }));
  },

  removeTodo: (id) => {
    const wasCompleted = _byId.get(id)?.completed ?? false;
    _byId.delete(id);
    const idx = _allIds.indexOf(id);
    if (idx !== -1) _allIds.splice(idx, 1);
    set((state) => ({
      version: state.version + 1,
      completedCount: state.completedCount - (wasCompleted ? 1 : 0),
    }));
  },

  updateTodo: (id, changes) => {
    const existing = _byId.get(id);
    if (!existing) return;

    const completedDelta =
      changes.completed !== undefined &&
      changes.completed !== existing.completed
        ? changes.completed
          ? 1
          : -1
        : 0;

    _byId.set(id, { ...existing, ...changes });
    set((state) => ({
      version: state.version + 1,
      completedCount: state.completedCount + completedDelta,
    }));
  },

  incrementSubtaskCount: (id, value) => {
    const existing = _byId.get(id);
    if (!existing) return;
    _byId.set(id, {
      ...existing,
      subtaskCount: Math.max(0, existing.subtaskCount + value),
    });
    set((state) => ({ version: state.version + 1 }));
  },
}));
