"use client";

import { useCallback, useMemo, useState, type ComponentProps } from "react";
import { move } from "@dnd-kit/helpers";
import type { DragDropProvider } from "@dnd-kit/react";
import type { Subtask, SubtasksResponse } from "@/types/todo";
import {
  createSubtask,
  deleteSubtask,
  fetchSubtasks,
  updateSubtask,
} from "@/features/subtasks/api";
import { ADD_TASK, DELETE_TASK, MAX_SUBTASKS_PER_TODO } from "@/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import getErrorMessage from "@/lib/utils/getErrorMessage";

type DragStartHandler = NonNullable<
  ComponentProps<typeof DragDropProvider>["onDragStart"]
>;
type DragEndHandler = NonNullable<
  ComponentProps<typeof DragDropProvider>["onDragEnd"]
>;

const POSITION_STEP = 1000;

type CompletionStats = {
  percentage: number;
  completedTasks: number;
  totalTasks: number;
};

function buildCompletionStats(
  completedTasks: number,
  totalTasks: number,
): CompletionStats {
  const percentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    percentage: percentage > 1 ? percentage : totalTasks > 0 ? 0.5 : 0,
    completedTasks,
    totalTasks,
  };
}

export function useSubtaskList(
  todoId: string,
  onSubtaskCountChange: (value: number) => void,
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: subtasksData,
    isPending: isLoadingSubtasks,
    isError: isErrorSubtasks,
  } = useQuery({
    queryKey: ["subtasks", todoId],
    queryFn: ({ signal }) => fetchSubtasks(todoId, signal),
  });

  const subtasks = useMemo(() => subtasksData?.subtasks ?? [], [subtasksData]);
  const completionStats = buildCompletionStats(
    subtasksData?.counts.completed ?? 0,
    subtasksData?.counts.all ?? 0,
  );

  const updateSubtasksMutation = useMutation({
    mutationFn: (data: {
      id: string;
      updatedData: Partial<Pick<Subtask, "title" | "completed" | "position">>;
    }) => updateSubtask(data.id, data.updatedData),
    onMutate: (data) => {
      const oldSubtaskData = queryClient
        .getQueryData<SubtasksResponse["data"]>(["subtasks", todoId])
        ?.subtasks.find((s) => s.id === data.id);

      if (!oldSubtaskData) return;

      queryClient.setQueryData<SubtasksResponse["data"]>(
        ["subtasks", todoId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            subtasks: old.subtasks.map((s) =>
              s.id === data.id ? { ...s, ...data.updatedData } : s,
            ),
            ...(data.updatedData.completed && {
              counts: {
                ...old.counts,
                completed: data.updatedData.completed
                  ? old.counts.completed + 1
                  : old.counts.completed - 1,
              },
            }),
          };
        },
      );

      return { data, oldSubtaskData };
    },
    onSuccess: () => {
      toast.success("Subtask updated");
    },
    onError: (error, _, ctx) => {
      if (ctx?.oldSubtaskData) {
        queryClient.setQueryData<SubtasksResponse["data"]>(
          ["subtasks", todoId],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              subtasks: old.subtasks.map((s) =>
                s.id === ctx.data.id ? ctx.oldSubtaskData : s,
              ),
              ...(ctx.data.updatedData.completed && {
                counts: {
                  ...old.counts,
                  completed: ctx.data.updatedData.completed
                    ? old.counts.completed + 1
                    : old.counts.completed - 1,
                },
              }),
            };
          },
        );
      }
      toast.error(getErrorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", todoId] });
    },
  });

  const createSubtasksMutation = useMutation({
    mutationFn: (title: string) => createSubtask(todoId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", todoId] });
      onSubtaskCountChange(ADD_TASK);
      toast.success("Subtask created");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteSubtasksMutation = useMutation({
    mutationFn: deleteSubtask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subtasks", todoId] });
      onSubtaskCountChange(DELETE_TASK);
      toast.success("Subtask deleted");
    },
    onError: () => {
      toast.error("Failed to delete subtask");
    },
  });

  const handleToggle = useCallback(
    (subtask: Subtask) => {
      const updatedCompletionStatus = !subtask.completed;

      updateSubtasksMutation.mutate({
        id: subtask.id,
        updatedData: { completed: updatedCompletionStatus },
      });
    },
    [updateSubtasksMutation],
  );

  const handleDragStart = useCallback<DragStartHandler>((event) => {
    if (event.operation.source) {
      setActiveId(String(event.operation.source.id));
    }
  }, []);

  const handleDragEnd = useCallback<DragEndHandler>(
    (event) => {
      setActiveId(null);
      if (event.canceled || !event.operation.source) return;

      const sourceId = String(event.operation.source.id);
      const reorderedList = move(subtasks, event);
      const newIndex = reorderedList.findIndex((s) => s.id === sourceId);
      const rowAbove = reorderedList[newIndex - 1];
      const rowBelow = reorderedList[newIndex + 1];

      if (!rowAbove && !rowBelow) return;

      let newPosition: number;
      if (!rowAbove) newPosition = Math.floor(rowBelow!.position / 2);
      else if (!rowBelow) newPosition = rowAbove.position + POSITION_STEP;
      else
        newPosition = Math.floor((rowAbove.position + rowBelow.position) / 2);

      updateSubtasksMutation.mutate({
        id: sourceId,
        updatedData: { position: newPosition },
      });
    },
    [subtasks, updateSubtasksMutation],
  );

  const updateSubtaskTitle = useCallback(
    (subtask: Subtask, title: string) => {
      const newTitle = title.trim();
      if (!newTitle || newTitle === subtask.title) return;

      updateSubtasksMutation.mutate({
        id: subtask.id,
        updatedData: { title: newTitle },
      });
    },
    [updateSubtasksMutation],
  );

  const handleCreate = useCallback(
    (title: string) => {
      const subtaskTitle = title.trim();
      if (!subtaskTitle) return;

      if (subtasks.length >= MAX_SUBTASKS_PER_TODO) {
        toast.error(
          `Maximum of ${MAX_SUBTASKS_PER_TODO} subtasks per todo reached`,
        );
        return;
      }

      createSubtasksMutation.mutate(subtaskTitle);
    },
    [createSubtasksMutation, subtasks.length],
  );

  return {
    state: {
      subtasks,
      activeId,
      loading: isLoadingSubtasks,
      error: isErrorSubtasks,
      completionStats,
      isAtSubtaskLimit: subtasks.length >= MAX_SUBTASKS_PER_TODO,
    },
    actions: {
      handleToggle,
      handleDragStart,
      handleDragEnd,
      updateSubtaskTitle,
      handleCreate,
      handleDeleteSubtask: deleteSubtasksMutation.mutateAsync,
    },
  };
}
