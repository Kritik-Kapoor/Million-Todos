"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle, GripVertical, Trash2 } from "lucide-react";

import { DragHandleRef } from "@/components/shared/VirtualList";
import { cn } from "@/lib/utils/tailwindMerge";
import { Subtask } from "@/types/todo";
import { Button } from "@/components/ui/button";

const SubtaskRow = ({
  subtask,
  style,
  dragHandleRef,
  isDragging,
  onToggle,
  onTitleUpdate,
  onDeleteSubtask,
}: {
  subtask: Subtask;
  style: React.CSSProperties;
  dragHandleRef?: DragHandleRef;
  isDragging?: boolean;
  onToggle: (subtask: Subtask) => void;
  onTitleUpdate: (subtask: Subtask, title: string) => void;
  onDeleteSubtask: (subtask: Subtask) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(subtask.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEdit = () => {
    setTitle(subtask.title);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setTitle(subtask.title);
    setIsEditing(false);
  };

  const commitEdit = () => {
    const newTitle = title.trim();
    if (!newTitle) {
      cancelEdit();
      return;
    }

    setIsEditing(false);
    if (newTitle !== subtask.title) {
      onTitleUpdate(subtask, newTitle);
    }
  };

  return (
    <div style={style} className="py-1">
      <div
        className={cn(
          "flex h-full items-center gap-3 rounded-xl border border-border/60 px-4",
          subtask.completed && "bg-muted/50",
          isDragging && "opacity-50 ring-2 ring-primary/40",
          !isEditing && !isDragging && "cursor-text",
        )}
      >
        {dragHandleRef && (
          <button
            ref={dragHandleRef}
            type="button"
            aria-label="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
        )}

        <button
          type="button"
          aria-label={subtask.completed ? "Mark incomplete" : "Mark complete"}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(subtask);
          }}
          className="shrink-0 cursor-pointer"
        >
          {subtask.completed ? (
            <CheckCircle2 className="size-4 text-emerald-600" />
          ) : (
            <Circle className="size-4 text-muted-foreground" />
          )}
        </button>

        <div
          className="flex-1 flex items-center justify-between gap-2 hover:bg-primary/10 rounded-xl p-1"
          onClick={() => {
            if (!isEditing && !isDragging) startEdit();
          }}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitEdit();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelEdit();
                }
              }}
              className="w-full bg-transparent text-sm outline-none"
              aria-label="Edit subtask title"
            />
          ) : (
            <p
              className={cn(
                "truncate text-sm",
                subtask.completed && "text-muted-foreground line-through",
              )}
            >
              {subtask.title}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Delete todo"
          className="size-9 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
          onClick={() => onDeleteSubtask(subtask)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default SubtaskRow;
