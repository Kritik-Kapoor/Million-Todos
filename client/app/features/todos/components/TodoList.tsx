"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { VirtualList } from "@/components/shared/VirtualList";
import SheetDialog from "@/components/shared/SheetDialog";
import SubtaskList from "@/features/subtasks/components/SubtaskList";
import EditableTodoTitle from "./EditableTodoTitle";
import type { Todo } from "@/types/todo";

type TodoListProps = {
  todos: Todo[];
  onToggleTodo: (id: string, completed: boolean) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateTodoTitle: (id: string, title: string, previousTitle: string) => void;
  handleSubtaskCountChange: (todoId: string, value: number) => void;
};

const ROW_HEIGHT = 80;
const CONTAINER_HEIGHT = 500;

const TodoList = ({
  todos,
  onToggleTodo,
  onDeleteTodo,
  onUpdateTodoTitle,
  handleSubtaskCountChange,
}: TodoListProps) => {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const handleTitleSave = (title: string) => {
    if (!selectedTodo) return;
    onUpdateTodoTitle(selectedTodo.id, title, selectedTodo.title);
    setSelectedTodo((prev) => (prev ? { ...prev, title } : null));
  };

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
              role="button"
              tabIndex={0}
              onClick={() => setSelectedTodo(todo)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedTodo(todo);
                }
              }}
              className={cn(
                "h-full cursor-pointer rounded-2xl border border-border/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTodo(todo.id, todo.completed);
                  }}
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

                <div className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground">
                  <Layers className="size-3.5" />
                  <span>
                    {todo.subtaskCount.toLocaleString()}{" "}
                    {todo.subtaskCount === 1 ? "subtask" : "subtasks"}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete todo"
                  className="size-9 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTodo(todo.id);
                  }}
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
        title={
          selectedTodo ? (
            <EditableTodoTitle
              title={selectedTodo.title}
              onSave={handleTitleSave}
            />
          ) : (
            ""
          )
        }
        titleLabel={selectedTodo?.title}
      >
        {selectedTodo && (
          <SubtaskList
            key={selectedTodo.id}
            todoId={selectedTodo.id}
            onSubtaskCountChange={(value) => {
              handleSubtaskCountChange(selectedTodo.id, value);
              setSelectedTodo((prev) =>
                prev
                  ? {
                      ...prev,
                      subtaskCount: Math.max(0, prev.subtaskCount + value),
                    }
                  : null,
              );
            }}
          />
        )}
      </SheetDialog>
    </>
  );
};

export default TodoList;
