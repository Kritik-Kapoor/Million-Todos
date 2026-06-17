"use client";

import { SubmitEvent, useRef, useState } from "react";
import { ListTodo, Plus } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import EmptyState from "@/components/shared/EmptyState";
import { VirtualList } from "@/components/shared/VirtualList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubtaskList } from "../hooks/useSubtaskList";
import SubtaskRow from "./SubtaskRow";
import SubtaskListSkeleton from "./Loading";
import { Progress } from "@/components/ui/progress";

const SUBTASK_ROW_HEIGHT = 56;
const SUBTASK_LIST_HEIGHT = 600;
const CREATE_FORM_HEIGHT = 52;

type SubtaskListProps = {
  todoId: string;
  onSubtaskCountChange: (value: number) => void;
};

const SubtaskList = ({ todoId, onSubtaskCountChange }: SubtaskListProps) => {
  const newTitleInputRef = useRef<HTMLInputElement>(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const {
    state: { subtasks, activeId, loading, error, completionStats },
    actions: {
      handleToggle,
      handleDragStart,
      handleDragEnd,
      updateSubtaskTitle,
      handleCreate,
      handleDeleteSubtask,
    },
  } = useSubtaskList(todoId, onSubtaskCountChange);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTitle.trim() || creating) return;

    setCreating(true);
    setCreateError(null);
    try {
      await handleCreate(newTitle);
      setNewTitle("");
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create subtask",
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <SubtaskListSkeleton
        height={SUBTASK_LIST_HEIGHT}
        rowHeight={SUBTASK_ROW_HEIGHT}
      />
    );
  }

  if (error) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-5">
      {completionStats.totalTasks > 0 && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground font-medium">
            {completionStats.completedTasks} of {completionStats.totalTasks}{" "}
            completed
          </p>
          <Progress value={completionStats.percentage} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <Input
          ref={newTitleInputRef}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a subtask…"
          aria-label="New subtask title"
          disabled={creating}
          className="h-11 rounded-xl"
        />
        <Button
          type="submit"
          disabled={creating || !newTitle.trim()}
          className="h-11 px-3 rounded-xl"
        >
          <Plus className="size-4" />
          Add
        </Button>
      </form>
      {createError && <p className="text-sm text-destructive">{createError}</p>}

      {subtasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No subtasks found"
          description="Break this todo into smaller steps by adding your first subtask."
          action={{
            label: "Add subtask",
            onClick: () => newTitleInputRef.current?.focus(),
          }}
          className="min-h-[400px] rounded-xl border border-dashed border-border/60"
        />
      ) : (
        <DragDropProvider
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <VirtualList
            items={subtasks}
            itemHeight={SUBTASK_ROW_HEIGHT}
            height={SUBTASK_LIST_HEIGHT - CREATE_FORM_HEIGHT}
            className="rounded-xl"
            isDraggableList
            getItemId={(subtask) => subtask.id}
            activeId={activeId}
            renderItem={(subtask, _i, style, dragHandleRef, isDragging) => (
              <SubtaskRow
                key={subtask.id}
                subtask={subtask}
                style={style}
                dragHandleRef={dragHandleRef}
                isDragging={isDragging}
                onToggle={handleToggle}
                onTitleUpdate={updateSubtaskTitle}
                onDeleteSubtask={handleDeleteSubtask}
              />
            )}
          />
        </DragDropProvider>
      )}
    </div>
  );
};

export default SubtaskList;
