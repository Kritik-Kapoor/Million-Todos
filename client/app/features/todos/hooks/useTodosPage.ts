"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Todo } from "@/types/todo";
import {
  buildFilterParams,
  createTodo,
  deleteTodo,
  hasActiveFilters,
  updateTodo,
} from "../api";
import type { TodoFilters } from "../api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { labelQueryKeys } from "@/features/settings/constants";
import { fetchLabels } from "@/features/settings/api";
import getErrorMessage from "@/lib/utils/getErrorMessage";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";
import { LabelItem } from "@/features/settings/types";
import { toast } from "sonner";
import { useTodoStore } from "../store";

const createTodoSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  selectedLabels: z.array(z.custom<SelectOption>()).optional(),
  dueDate: z.date().optional(),
});

type CreateTodoValues = z.infer<typeof createTodoSchema>;

function labelToOption(label: LabelItem): SelectOption {
  return { value: label.id, label: label.name, color: label.color };
}

export function useTodosPage() {
  const {
    addTodoBatch,
    addTodo,
    replaceTodo,
    removeTodo,
    updateTodo: updateTodoInStore,
    incrementSubtaskCount,
  } = useTodoStore();

  useTodoStore((state) => state.version);
  const todoIds = useTodoStore.getState().allIds;
  const completedCount = useTodoStore((state) => state.completedCount);
  const activeCount = todoIds.length - completedCount;

  // ── Filter state ──
  const [filters, setFiltersState] = useState<TodoFilters>({});
  // null = not filtering; string[] = filtered IDs (may be empty if no matches)
  const [filteredTodoIds, setFilteredTodoIds] = useState<string[] | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const filterAbortRef = useRef<AbortController | null>(null);

  const isFiltering = filteredTodoIds !== null;
  const displayTodoIds = isFiltering ? filteredTodoIds : todoIds;

  const form = useForm<CreateTodoValues>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: { title: "", selectedLabels: [], dueDate: undefined },
  });

  const {
    data: labels,
    isPending: fetchingLabels,
    error: labelsError,
  } = useQuery({
    queryKey: labelQueryKeys.all,
    queryFn: ({ signal }) => fetchLabels(signal),
  });

  const labelOptions = useMemo(
    () => labels?.map(labelToOption) ?? [],
    [labels],
  );

  const selectedLabels = useWatch({
    control: form.control,
    name: "selectedLabels",
  });

  useEffect(() => {
    const controller = new AbortController();

    const streamTodos = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/todos`,
          { credentials: "include", signal: controller.signal },
        );

        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let todosBatch: Todo[] = [];

        const flushBatch = () => {
          if (todosBatch.length === 0) return;
          const batch = todosBatch;
          todosBatch = [];
          addTodoBatch(batch);
        };

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            flushBatch();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line) as Todo & { error?: string };
              if (parsed.error) {
                console.error("[stream] server error:", parsed.error);
                flushBatch();
                return;
              }
              todosBatch.push(parsed);
              if (todosBatch.length >= 10_000) flushBatch();
            } catch {
              console.error("[stream] failed to parse line:", line);
            }
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
  }, [addTodoBatch]);

  const createTodoMutation = useMutation({
    mutationFn: createTodo,
    onMutate: (data) => {
      const tempId = crypto.randomUUID();
      addTodo({
        id: tempId,
        title: data.title,
        completed: false,
        subtaskCount: 0,
        dueDate: data.dueDate?.toISOString() ?? null,
      });
      return { tempId };
    },
    onSuccess: (data, _, ctx) => {
      replaceTodo(ctx.tempId, data);
      form.reset();
    },
    onError: (error, _, ctx) => {
      if (ctx?.tempId) removeTodo(ctx.tempId);
      toast.error(getErrorMessage(error));
    },
  });

  const handleCreateTodo = useCallback(
    (data: CreateTodoValues) => {
      const { title, selectedLabels, dueDate } = data;
      const trimmedTitle = title.trim();
      if (!trimmedTitle) return toast.error("Title is required");

      createTodoMutation.mutate({
        title: trimmedTitle,
        labels: selectedLabels?.map((o) => o.value),
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
    },
    [createTodoMutation],
  );

  const toggleTodoMutation = useMutation({
    mutationFn: (data: { id: string; completed: boolean }) =>
      updateTodo(data.id, { completed: data.completed }),
    onMutate: (data) => {
      updateTodoInStore(data.id, { completed: data.completed });
      return { id: data.id, completed: data.completed };
    },
    onError: (error, _, ctx) => {
      if (ctx?.id) updateTodoInStore(ctx.id, { completed: !ctx.completed });
      toast.error(getErrorMessage(error));
    },
  });

  const handleToggleTodo = useCallback(
    (id: string, currentCompletionStatus: boolean) => {
      if (!id) return toast.error("Failed to update todo completion status");
      toggleTodoMutation.mutate({ id, completed: !currentCompletionStatus });
    },
    [toggleTodoMutation],
  );

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    onMutate: (id) => {
      const todoData = useTodoStore.getState().byId.get(id);
      removeTodo(id);
      return { id, todoData };
    },
    onError: (error, _, ctx) => {
      if (ctx?.todoData) addTodo(ctx.todoData);
      toast.error(getErrorMessage(error));
    },
  });

  const updateTodoTitleMutation = useMutation({
    mutationFn: (data: { id: string; title: string }) =>
      updateTodo(data.id, { title: data.title }),
    onMutate: (data) => {
      const previousTitle = useTodoStore.getState().byId.get(data.id)?.title;
      updateTodoInStore(data.id, { title: data.title });
      return { id: data.id, previousTitle };
    },
    onError: (error, _, ctx) => {
      if (ctx?.id && ctx.previousTitle !== undefined)
        updateTodoInStore(ctx.id, { title: ctx.previousTitle });
      toast.error(getErrorMessage(error));
    },
  });

  const handleUpdateTodoTitle = useCallback(
    (id: string, title: string, previousTitle: string) => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle || trimmedTitle === previousTitle) return;
      updateTodoTitleMutation.mutate({ id, title: trimmedTitle });
    },
    [updateTodoTitleMutation],
  );

  const handleSubtaskCountChange = useCallback(
    (todoId: string, value: number) => {
      if (!todoId) return;
      incrementSubtaskCount(todoId, value);
    },
    [incrementSubtaskCount],
  );

  // ── Filter actions ──
  const applyFilters = useCallback(
    async (newFilters: TodoFilters) => {
      setFiltersState(newFilters);

      if (!hasActiveFilters(newFilters)) {
        filterAbortRef.current?.abort();
        setFilteredTodoIds(null);
        setIsLoadingFilters(false);
        return;
      }

      filterAbortRef.current?.abort();
      const controller = new AbortController();
      filterAbortRef.current = controller;

      setIsLoadingFilters(true);
      setFilteredTodoIds([]); // enter filtering mode immediately (shows empty state while loading)

      try {
        const params = buildFilterParams(newFilters);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/filter?${params}`,
          { credentials: "include", signal: controller.signal },
        );

        if (!response.ok || !response.body) {
          toast.error("Failed to apply filters");
          setFilteredTodoIds(null);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const ids: string[] = [];

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setFilteredTodoIds([...ids]);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line) as Todo & { error?: string };
              if (parsed.error) {
                toast.error("Filter error: " + parsed.error);
                setFilteredTodoIds([...ids]);
                return;
              }
              ids.push(parsed.id);
              // Fallback if filter runs before initial getTodos stream reaches this todo
              if (!useTodoStore.getState().byId.get(parsed.id)) {
                addTodo(parsed);
              }
            } catch {
              console.error("[filter stream] failed to parse line:", line);
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to apply filters");
          setFilteredTodoIds(null);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingFilters(false);
      }
    },
    [addTodo],
  );

  const clearFilters = useCallback(() => {
    filterAbortRef.current?.abort();
    setFiltersState({});
    setFilteredTodoIds(null);
    setIsLoadingFilters(false);
  }, []);

  return {
    state: {
      form,
      labelOptions,
      selectedLabels,
      fetchingLabels,
      labelsError: labelsError ? getErrorMessage(labelsError) : null,
      todoIds: displayTodoIds,
      completedCount,
      activeCount,
      isCreatingTodo: createTodoMutation.isPending,
      isFiltering,
      isLoadingFilters,
      filters,
    },
    actions: {
      handleCreateTodo,
      handleToggleTodo,
      handleDeleteTodo: deleteTodoMutation.mutate,
      handleUpdateTodoTitle,
      handleSubtaskCountChange,
      applyFilters,
      clearFilters,
    },
  };
}
