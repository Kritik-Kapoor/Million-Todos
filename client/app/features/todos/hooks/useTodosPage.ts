"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useThrottledFlush } from "@/hooks/useThrottledFlush";
import type {
  Todo,
  TodoLabel,
  TodoMetaDataChangeDataParams,
} from "@/types/todo";
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

function labelIdsToTodoLabels(
  labelIds: string[],
  options: SelectOption[],
): TodoLabel[] {
  return labelIds.flatMap((id) => {
    const option = options.find((o) => o.value === id);
    if (!option) return [];
    return [
      { id: option.value, name: option.label, color: option.color as string },
    ];
  });
}

export function useTodosPage() {
  const {
    resetTodos,
    addTodoBatch,
    addTodo,
    replaceTodo,
    removeTodo,
    updateTodo: updateTodoInStore,
    incrementSubtaskCount,
  } = useTodoStore();

  const {
    push: pushTodos,
    flush: flushTodos,
    clear: clearTodos,
  } = useThrottledFlush<Todo>(addTodoBatch, 200);

  const totalCount = useTodoStore((state) => state.allIds.length);
  const completedCount = useTodoStore((state) => state.completedCount);
  const activeCount = totalCount - completedCount;
  const todoIds = useTodoStore((state) => state.allIds);

  const [filters, setFiltersState] = useState<TodoFilters>({});
  const [filteredTodoIds, setFilteredTodoIds] = useState<string[] | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const filterAbortRef = useRef<AbortController | null>(null);

  const isFiltering = filteredTodoIds !== null;

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
    resetTodos();

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

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            flushTodos();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          const batchTodos: Todo[] = [];
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line) as Todo & { error?: string };
              if (parsed.error) {
                console.error("[stream] server error:", parsed.error);
                flushTodos();
                return;
              }
              batchTodos.push(parsed);
            } catch {
              console.error("[stream] failed to parse line:", line);
            }
          }
          if (batchTodos.length > 0) pushTodos(batchTodos);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("[stream] error:", err);
        }
      }
    };

    streamTodos();
    return () => {
      controller.abort();
      clearTodos();
    };
  }, [pushTodos, flushTodos, clearTodos, resetTodos]);

  const createTodoMutation = useMutation({
    mutationFn: createTodo,
    onMutate: (data) => {
      const tempId = crypto.randomUUID();
      addTodo({
        id: tempId,
        title: data.title,
        description: null,
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

  const handleSubtaskCountChange = useCallback(
    (todoId: string, value: number) => {
      if (!todoId) return;
      incrementSubtaskCount(todoId, value);
    },
    [incrementSubtaskCount],
  );

  const updateTodoDueDateMutation = useMutation({
    mutationFn: ({ id, dueDate }: { id: string; dueDate: Date | null }) =>
      updateTodo(id, { dueDate }),
    onMutate: ({ id, dueDate }) => {
      const previousDueDate = useTodoStore.getState().byId.get(id)?.dueDate;
      updateTodoInStore(id, {
        dueDate: dueDate ? dueDate.toISOString() : null,
      });
      return { id, previousDueDate };
    },
    onError: (error, _, ctx) => {
      if (ctx?.id) updateTodoInStore(ctx.id, { dueDate: ctx.previousDueDate });
      toast.error(getErrorMessage(error));
    },
  });

  const updateTodoLabelsMutation = useMutation({
    mutationFn: ({ id, labelIds }: { id: string; labelIds: string[] }) =>
      updateTodo(id, { labels: labelIds }),
    onMutate: ({ id, labelIds }) => {
      const previousLabels = useTodoStore.getState().byId.get(id)?.labels;
      updateTodoInStore(id, {
        labels: labelIdsToTodoLabels(labelIds, labelOptions),
      });
      return { id, previousLabels };
    },
    onError: (error, _, ctx) => {
      if (ctx?.id) updateTodoInStore(ctx.id, { labels: ctx.previousLabels });
      toast.error(getErrorMessage(error));
    },
  });

  const updateTodoDescriptionMutation = useMutation({
    mutationFn: ({
      id,
      description,
    }: {
      id: string;
      description: string | null;
    }) => updateTodo(id, { description }),
    onMutate: ({ id, description }) => {
      const previousDescription = useTodoStore
        .getState()
        .byId.get(id)?.description;
      updateTodoInStore(id, { description });
      return { id, previousDescription };
    },
    onError: (error, _, ctx) => {
      if (ctx?.id)
        updateTodoInStore(ctx.id, { description: ctx.previousDescription });
      toast.error(getErrorMessage(error));
    },
  });

  const handleTodoMetaDataChange = useCallback(
    ({ id, updateFields, data }: TodoMetaDataChangeDataParams) => {
      if (!id) return toast.error("Failed to update todo, id not found!");
      if (updateFields === "title")
        updateTodoTitleMutation.mutate({ id, title: data.title! });
      else if (updateFields === "dueDate")
        updateTodoDueDateMutation.mutate({ id, dueDate: data.dueDate ?? null });
      else if (updateFields === "labels")
        updateTodoLabelsMutation.mutate({ id, labelIds: data.labels ?? [] });
      else if (updateFields === "description")
        updateTodoDescriptionMutation.mutate({
          id,
          description: data.description ?? null,
        });
    },
    [
      updateTodoTitleMutation,
      updateTodoDueDateMutation,
      updateTodoLabelsMutation,
      updateTodoDescriptionMutation,
    ],
  );

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
      setFilteredTodoIds([]);

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
      todoIds,
      totalCount,
      completedCount,
      activeCount,
      isCreatingTodo: createTodoMutation.isPending,
      isUpdatingTodoDueDate: updateTodoDueDateMutation.isPending,
      isUpdatingTodoLabels: updateTodoLabelsMutation.isPending,
      isFiltering,
      isLoadingFilters,
      filters,
      filteredTodoIds,
    },
    actions: {
      handleCreateTodo,
      handleToggleTodo,
      handleDeleteTodo: deleteTodoMutation.mutate,
      handleTodoMetaDataChange,
      handleSubtaskCountChange,
      applyFilters,
      clearFilters,
    },
  };
}
