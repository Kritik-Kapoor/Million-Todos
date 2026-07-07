import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/tailwindMerge";
import { CheckCircle2, Circle, Layers, Trash2 } from "lucide-react";
import DueDateBadge from "./DueDateBadge";
import TodoLabelBadges from "./TodoLabelBadges";
import { useTodoStore } from "../store";

const TodoRow = ({
  id,
  style,
  onToggleTodo,
  onDeleteTodo,
  onSelectTodo,
}: {
  id: string;
  style: React.CSSProperties;
  onToggleTodo: (id: string, completed: boolean) => void;
  onDeleteTodo: (id: string) => void;
  onSelectTodo: () => void;
}) => {
  useTodoStore((state) => state.version);
  const todo = useTodoStore.getState().byId.get(id);

  if (!todo) return <div style={style} />;

  return (
    <div key={todo.id} style={style} className="px-0.5 py-1">
      <Card
        role="button"
        tabIndex={0}
        onClick={onSelectTodo}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectTodo();
          }
        }}
        className={cn(
          "h-full cursor-pointer rounded-2xl border border-border/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
          todo.completed && "bg-muted/50",
        )}
        data-todo-card=""
      >
        <div className="flex h-full items-center gap-2">
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
            <div className="flex items-center gap-2">
              <p
                data-todo-title
                className={cn(
                  "truncate font-medium",
                  todo.completed && "text-muted-foreground line-through",
                )}
              >
                {todo.title}
              </p>
              {todo.dueDate && !todo.completed && (
                <DueDateBadge dueDate={todo.dueDate} />
              )}
            </div>
            {todo.labels && todo.labels.length > 0 && (
              <TodoLabelBadges labels={todo.labels} className="mt-1.5" />
            )}
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
              if (todo.id) onDeleteTodo(todo.id);
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TodoRow;
