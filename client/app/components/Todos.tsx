"use client";

import { SubmitEvent, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Todo } from "@/types/todo";
import dynamic from "next/dynamic";

// Can't use SSR with react-window since it uses ResizeObserver and window so the page needs to be rendered in the browser.
// and to ensure the List mounts with accurate browser dimensions for the VirtualList to work correctly.
const TodoList = dynamic(() => import("./TodoList"), { ssr: false });

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const streamTodos = async () => {
      let todosBatch: Todo[] = [];
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/todos`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            if (todosBatch.length > 0)
              setTodos((prev) => [...prev, ...todosBatch]);
            break;
          }
          // Wait for the next chunk of data, since the current chunk might have incomplete lines
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          // Last element may be an incomplete chunk, keep it in the buffer so that it can be processed in the next iteration
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line) as Todo & {
                error?: string;
              };
              if (parsed.error) {
                // Need to show this error in UI
                console.error("[stream] server error:", parsed.error);
                // Flush whatever we have so the UI isn't left empty
                if (todosBatch.length > 0) {
                  const batch = todosBatch;
                  todosBatch = [];
                  setTodos((prev) => [...prev, ...batch]);
                }
                return;
              }
              todosBatch.push(parsed);
            } catch {
              console.error("[stream] failed to parse line:", line);
            }
          }
          // Do setState in batches to avoid re-rendering the entire list 1M times.
          // Doing individual setState calls for each todo would be too slow and will cause the UI to freeze and crash for large lists.
          // Doing individual setState calls will equate to 1M re-renders.
          // Whereas with batching: 1M/10k -> 100 batches -> 100 re-renders.
          if (todosBatch.length >= 10000) {
            const batch = todosBatch;
            todosBatch = [];
            setTodos((prev) => [...prev, ...batch]);
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("[stream] error:", err);
        }
      }
    };

    streamTodos();

    return () => controller.abort();
  }, []);

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
        subtaskCount: 0,
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
              <br />
              list as you finish.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:min-w-80">
            <Card className="gap-1 rounded-2xl p-4 text-center min-w-[140px]">
              <span className="text-2xl font-semibold">{todos.length}</span>
              <span className="text-muted-foreground">Total</span>
            </Card>
            <Card className="gap-1 rounded-2xl p-4 text-center min-w-[140px]">
              <span className="text-2xl font-semibold">{activeCount}</span>
              <span className="text-muted-foreground">Active</span>
            </Card>
            <Card className="gap-1 rounded-2xl p-4 text-center min-w-[140px]">
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
