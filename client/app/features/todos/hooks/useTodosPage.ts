"use client";

import { SubmitEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { Todo } from "@/types/todo";
import { deleteTodo, updateTodo } from "../api";

export function useTodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");

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

          // Wait for the next chunk of data, since the current chunk might have incomplete lines.
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Last element may be an incomplete chunk, keep it in the buffer so that it can be processed in the next iteration
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line) as Todo & { error?: string };
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

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos],
  );

  const activeCount = useMemo(
    () => todos.length - completedCount,
    [todos, completedCount],
  );

  const handleCreateTodo = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
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
    },
    [newTodoTitle],
  );

  const handleToggleTodo = useCallback((id: string, completed: boolean) => {
    const newCompleted = !completed;

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)),
    );

    updateTodo(id, { completed: newCompleted }).catch(() => {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed } : t)),
      );
    });
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    deleteTodo(id).catch((err) => {
      console.error("[Todos] failed to delete todo:", err);
    });
  }, []);

  const handleUpdateTodoTitle = useCallback(
    (id: string, title: string, previousTitle: string) => {
      const trimmed = title.trim();
      if (!trimmed || trimmed === previousTitle) return;

      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t)),
      );

      updateTodo(id, { title: trimmed }).catch(() => {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, title: previousTitle } : t)),
        );
      });
    },
    [],
  );

  const handleSubtaskCountChange = useCallback(
    (todoId: string, value: number) => {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todoId
            ? { ...t, subtaskCount: Math.max(0, t.subtaskCount + value) }
            : t,
        ),
      );
    },
    [],
  );

  return {
    state: {
      todos,
      newTodoTitle,
      completedCount,
      activeCount,
    },
    actions: {
      setNewTodoTitle,
      handleCreateTodo,
      handleToggleTodo,
      handleDeleteTodo,
      handleUpdateTodoTitle,
      handleSubtaskCountChange,
    },
  };
}
