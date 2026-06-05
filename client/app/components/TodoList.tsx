"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Layers,
  GripVertical,
} from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { VirtualList, type DragHandleRef } from "./shared/VirtualList";
import SheetDialog from "./shared/SheetDialog";
import type { Todo, Subtask } from "@/types/todo";

type TodoListProps = {
  todos: Todo[];
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
};

const ROW_HEIGHT = 80;
const CONTAINER_HEIGHT = 500;
const SUBTASK_ROW_HEIGHT = 56;
const SUBTASK_LIST_HEIGHT = 500;

// ─── Subtask sheet ────

const SubtaskRow = ({
  subtask,
  style,
  dragHandleRef,
  isDragging,
}: {
  subtask: Subtask;
  style: React.CSSProperties;
  dragHandleRef?: DragHandleRef;
  isDragging?: boolean;
}) => (
  <div style={style} className="px-1 py-1">
    <div
      className={cn(
        "flex h-full items-center gap-3 rounded-xl border border-border/60 px-4",
        subtask.completed && "bg-muted/50",
        isDragging && "opacity-50 ring-2 ring-primary/40",
      )}
    >
      {/* Drag handle — only rendered when dragHandleRef is provided */}
      {dragHandleRef && (
        <button
          ref={dragHandleRef}
          type="button"
          aria-label="Drag to reorder"
          className="shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      )}

      {subtask.completed ? (
        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
      ) : (
        <Circle className="size-4 shrink-0 text-muted-foreground" />
      )}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm",
            subtask.completed && "text-muted-foreground line-through",
          )}
        >
          {subtask.title}
        </p>
      </div>
    </div>
  </div>
);

// --- Draggable subtask list ---
// Isolated component so DragDropProvider + subtask state live together cleanly.

const DraggableSubtaskList = ({
  initialSubtasks,
}: {
  initialSubtasks: Subtask[];
}) => {
  const [subtasks, setSubtasks] = useState(initialSubtasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <DragDropProvider
      onDragStart={(event) => {
        if (event.operation.source) {
          setActiveId(String(event.operation.source.id));
        }
      }}
      onDragEnd={(event) => {
        setActiveId(null);
        if (!event.canceled) {
          setSubtasks((prev) => move(prev, event));
        }
      }}
    >
      <VirtualList
        items={subtasks}
        itemHeight={SUBTASK_ROW_HEIGHT}
        height={SUBTASK_LIST_HEIGHT}
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
          />
        )}
      />
    </DragDropProvider>
  );
};

// ─── Todo list ───────────────────────────────────────────────────────────────

const TodoList = ({ todos, onToggleTodo, onDeleteTodo }: TodoListProps) => {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  if (todos.length === 0) {
    return (
      <Card className="items-center rounded-2xl border-dashed p-10 text-center">
        <div className="rounded-full bg-muted p-3">
          <CheckCircle2 className="size-6 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-base font-semibold">No todos yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first task above to start building momentum.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <VirtualList
        items={todos}
        itemHeight={ROW_HEIGHT}
        height={CONTAINER_HEIGHT}
        className="rounded-2xl"
        renderItem={(todo, _index, style) => (
          <div key={todo.id} style={style} className="px-0.5 py-1">
            <Card
              className={cn(
                "h-full rounded-2xl border border-border/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                todo.completed && "bg-muted/50",
              )}
            >
              <div className="flex h-full items-center gap-2 px-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={
                    todo.completed ? "Mark todo incomplete" : "Complete todo"
                  }
                  className={cn(
                    "size-9 shrink-0 rounded-full",
                    todo.completed && "text-emerald-600",
                  )}
                  onClick={() => onToggleTodo(todo.id)}
                >
                  {todo.completed ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <Circle className="size-5" />
                  )}
                </Button>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      todo.completed && "text-muted-foreground line-through",
                    )}
                  >
                    {todo.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {todo.completed ? "Completed" : "Ready to work on"}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={todo.subtaskCount === 0}
                  aria-label={
                    todo.subtaskCount > 0
                      ? `View ${todo.subtaskCount} subtasks`
                      : "No subtasks"
                  }
                  onClick={() => todo.subtaskCount > 0 && setSelectedTodo(todo)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition",
                    todo.subtaskCount > 0
                      ? "cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground"
                      : "cursor-default text-muted-foreground/50",
                  )}
                >
                  <Layers className="size-3.5" />
                  <span>
                    {todo.subtaskCount.toLocaleString()}{" "}
                    {todo.subtaskCount === 1 ? "subtask" : "subtasks"}
                  </span>
                </button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete todo"
                  className="size-9 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                  onClick={() => onDeleteTodo(todo.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      />

      <SheetDialog
        isOpen={selectedTodo !== null}
        onClose={() => setSelectedTodo(null)}
        title={selectedTodo?.title ?? ""}
        description={`${selectedTodo?.subtaskCount.toLocaleString() ?? 0} ${
          selectedTodo?.subtaskCount === 1 ? "subtask" : "subtasks"
        }`}
      >
        {selectedTodo && (
          // TODO: Fetch subtasks from the server
          <DraggableSubtaskList key={selectedTodo.id} initialSubtasks={[]} />
        )}
      </SheetDialog>
    </>
  );
};

export default TodoList;
