"use client";

import { useCallback, useEffect, useState, type ComponentProps } from "react";
import { move } from "@dnd-kit/helpers";
import type { DragDropProvider } from "@dnd-kit/react";
import type { Subtask } from "@/types/todo";
import {
  createSubtask,
  deleteSubtask,
  fetchSubtasks,
  updateSubtask,
} from "@/features/subtasks/api";
import { ADD_TASK, DELETE_TASK } from "@/constants";

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
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [completionStats, setCompletionStats] = useState<CompletionStats>(() =>
    buildCompletionStats(0, 0),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadSubtasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const { subtasks: fetchedSubtasks, counts } = await fetchSubtasks(
          todoId,
          controller.signal,
        );
        setSubtasks(fetchedSubtasks);
        setCompletionStats(buildCompletionStats(counts.completed, counts.all));
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    loadSubtasks();
    return () => controller.abort();
  }, [todoId]);

  const handleToggle = useCallback((subtask: Subtask) => {
    const updatedCompletionStatus = !subtask.completed;

    setSubtasks((prev) =>
      prev.map((s) =>
        s.id === subtask.id ? { ...s, completed: updatedCompletionStatus } : s,
      ),
    );
    setCompletionStats((prev) =>
      buildCompletionStats(
        updatedCompletionStatus
          ? prev.completedTasks + 1
          : prev.completedTasks - 1,
        prev.totalTasks,
      ),
    );

    updateSubtask(subtask.id, { completed: updatedCompletionStatus }).catch(
      () => {
        setSubtasks((prev) =>
          prev.map((s) =>
            s.id === subtask.id ? { ...s, completed: subtask.completed } : s,
          ),
        );
        setCompletionStats((prev) =>
          buildCompletionStats(
            updatedCompletionStatus
              ? prev.completedTasks - 1
              : prev.completedTasks + 1,
            prev.totalTasks,
          ),
        );
      },
    );
  }, []);

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

      if (!rowAbove && !rowBelow) {
        setSubtasks(reorderedList);
        return;
      }

      let newPosition: number;
      if (!rowAbove) newPosition = Math.floor(rowBelow!.position / 2);
      else if (!rowBelow) newPosition = rowAbove.position + POSITION_STEP;
      else
        newPosition = Math.floor((rowAbove.position + rowBelow.position) / 2);

      setSubtasks(
        reorderedList.map((s) =>
          s.id === sourceId ? { ...s, position: newPosition } : s,
        ),
      );

      updateSubtask(sourceId, { position: newPosition }).catch((err) => {
        console.error("[SubtaskList] failed to persist position:", err);
      });
    },
    [subtasks],
  );

  const updateSubtaskTitle = useCallback((subtask: Subtask, title: string) => {
    const newTitle = title.trim();
    if (!newTitle || newTitle === subtask.title) return;

    const previousTitle = subtask.title;

    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtask.id ? { ...s, title: newTitle } : s)),
    );

    updateSubtask(subtask.id, { title: newTitle }).catch(() => {
      setSubtasks((prev) =>
        prev.map((s) =>
          s.id === subtask.id ? { ...s, title: previousTitle } : s,
        ),
      );
    });
  }, []);

  const handleCreate = useCallback(
    async (title: string) => {
      const subtaskTitle = title.trim();
      if (!subtaskTitle) return;

      const created = await createSubtask(todoId, subtaskTitle);
      setSubtasks((prev) => [...prev, created]);
      setCompletionStats((prev) =>
        buildCompletionStats(prev.completedTasks, prev.totalTasks + 1),
      );
      onSubtaskCountChange(ADD_TASK);
    },
    [todoId, onSubtaskCountChange],
  );

  const handleDeleteSubtask = useCallback(
    async (subtask: Subtask) => {
      const isDeleted = await deleteSubtask(subtask.id);
      if (isDeleted?.status !== "success") return;

      setSubtasks((prev) => prev.filter((s) => s.id !== subtask.id));

      setCompletionStats((stats) =>
        buildCompletionStats(
          stats.completedTasks - (subtask.completed ? 1 : 0),
          stats.totalTasks - 1,
        ),
      );
      onSubtaskCountChange(DELETE_TASK);
    },
    [onSubtaskCountChange],
  );

  return {
    state: {
      subtasks,
      activeId,
      loading,
      error,
      completionStats,
    },
    actions: {
      handleToggle,
      handleDragStart,
      handleDragEnd,
      updateSubtaskTitle,
      handleCreate,
      handleDeleteSubtask,
    },
  };
}
