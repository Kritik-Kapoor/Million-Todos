"use client";

import { SubmitEvent, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Todo } from "./TodoList";

// react-window uses ResizeObserver and window — skip SSR to avoid a hang/crash
// and to ensure the List mounts with accurate browser dimensions.
const TodoList = dynamic(() => import("./TodoList"), { ssr: false });

const Todos = () => {
  // Lazy initializer so the 1M-item array is only created on the client,
  // never during server rendering.
  const [todos, setTodos] = useState<Todo[]>(() => {
    // Todos with large subtask lists to exercise VirtualList inside the sheet.
    const LARGE_SUBTASK_IDS = new Set([1, 5]); // 10 000 subtasks each
    const MEDIUM_SUBTASK_IDS = new Set([100, 250]); // 1 000 subtasks each

    return Array.from({ length: 1_000_000 }, (_, index) => {
      const todoNumber = index + 1;
      const subtaskCount = LARGE_SUBTASK_IDS.has(todoNumber)
        ? 10_000
        : MEDIUM_SUBTASK_IDS.has(todoNumber)
          ? 1_000
          : 0;

      return {
        id: String(todoNumber),
        title: `Todo no. ${todoNumber}`,
        completed: false,
        subtasks: Array.from({ length: subtaskCount }, (_, si) => ({
          id: `${todoNumber}-${si + 1}`,
          title: `Subtask ${si + 1} of Todo no. ${todoNumber}`,
          completed: false,
        })),
      };
    });
  });
  const [newTodoTitle, setNewTodoTitle] = useState("");

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos],
  );

  const activeCount = todos.length - completedCount;

  const handleCreateTodo = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = newTodoTitle.trim();
    if (!title) return;

    setTodos((currentTodos) => [
      {
        id: crypto.randomUUID(),
        title,
        completed: false,
        subtasks: [],
      },
      ...currentTodos,
    ]);
    setNewTodoTitle("");
  };

  const handleToggleTodo = (id: string) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-primary/10 via-background to-muted/50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Million Todos
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Today&apos;s focus
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Capture tasks quickly, track what is still active, and clear the
              list as you finish.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:min-w-80">
            <Card className="gap-1 rounded-2xl p-4 text-center">
              <span className="text-2xl font-semibold">{todos.length}</span>
              <span className="text-muted-foreground">Total</span>
            </Card>
            <Card className="gap-1 rounded-2xl p-4 text-center">
              <span className="text-2xl font-semibold">{activeCount}</span>
              <span className="text-muted-foreground">Active</span>
            </Card>
            <Card className="gap-1 rounded-2xl p-4 text-center">
              <span className="text-2xl font-semibold">{completedCount}</span>
              <span className="text-muted-foreground">Done</span>
            </Card>
          </div>
        </div>
      </section>

      <Card className="rounded-2xl p-4 shadow-sm sm:p-5">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={handleCreateTodo}
        >
          <Input
            value={newTodoTitle}
            onChange={(event) => setNewTodoTitle(event.target.value)}
            placeholder="Add a new todo..."
            aria-label="New todo title"
            className="h-11 flex-1 rounded-xl bg-background px-4 text-sm"
          />
          <Button
            type="submit"
            size="lg"
            className="h-11 rounded-xl px-4 sm:min-w-32"
          >
            <Plus className="size-4" />
            Add todo
          </Button>
        </form>
      </Card>

      <TodoList
        todos={todos}
        onToggleTodo={handleToggleTodo}
        onDeleteTodo={handleDeleteTodo}
      />
    </div>
  );
};

export default Todos;
