import { create } from "zustand";
import type { Todo } from "@/types/todo";

// ---------------------------------------------------------------------------
// Internal mutable data structures — never replaced, only mutated in place.
// This avoids the O(n²) spread copies that occur when every addTodoBatch call
// clones the entire accumulated byId / allIds collection.
// ---------------------------------------------------------------------------
const _byId = new Map<string, Todo>();
const _allIds: string[] = [];

type TodoStore = {
  // `version` is the only reactive signal. It's a cheap number that bumps on
  // every logical change so React knows to re-render. byId and allIds are
  // stable references to the mutable structures above.
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
    let completedDelta = 0;
    for (const todo of todos) {
      _byId.set(todo.id, todo);
      _allIds.push(todo.id);
      if (todo.completed) completedDelta++;
    }
    set((state) => ({
      version: state.version + 1,
      completedCount: state.completedCount + completedDelta,
    }));
  },

  addTodo: (todo) => {
    _byId.set(todo.id, todo);
    _allIds.push(todo.id);
    set((state) => ({ version: state.version + 1 }));
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
    _byId.set(id, { ...existing, ...changes });
    set((state) => ({
      version: state.version + 1,
      completedCount:
        changes.completed !== undefined
          ? state.completedCount + (changes.completed ? 1 : -1)
          : state.completedCount,
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
