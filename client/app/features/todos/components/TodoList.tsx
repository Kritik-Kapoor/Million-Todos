"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import SheetDialog from "@/components/shared/SheetDialog";
import SubtaskList from "@/features/subtasks/components/SubtaskList";
import EditableTodoTitle from "./EditableTodoTitle";
import { useUiSettings } from "@/features/settings/context/UiSettingsContext";
import TodoRow from "./TodoRow";
import IndexedVirtualList from "@/components/shared/IndexedVirtualList";
import { useTodoStore } from "../store";

type TodoListProps = {
  todoIds: string[];
  onToggleTodo: (id: string, completed: boolean) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateTodoTitle: (id: string, title: string, previousTitle: string) => void;
  handleSubtaskCountChange: (todoId: string, value: number) => void;
};

const ROW_HEIGHT = 80;
const COMPACT_ROW_HEIGHT = 56;
const CONTAINER_HEIGHT = 500;

const TodoList = ({
  todoIds,
  onToggleTodo,
  onDeleteTodo,
  onUpdateTodoTitle,
  handleSubtaskCountChange,
}: TodoListProps) => {
  const { density } = useUiSettings();
  const itemHeight = density === "compact" ? COMPACT_ROW_HEIGHT : ROW_HEIGHT;

  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  const selectedTodo = useTodoStore((state) =>
    selectedTodoId ? state.byId[selectedTodoId] : null,
  );

  const handleTitleSave = (title: string) => {
    if (!selectedTodo) return;
    onUpdateTodoTitle(selectedTodo.id, title, selectedTodo.title);
  };

  if (todoIds.length === 0) {
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
      <IndexedVirtualList
        itemCount={todoIds.length}
        itemHeight={itemHeight}
        height={CONTAINER_HEIGHT}
        className="rounded-2xl"
        renderItem={(index, style) => {
          const todoId = todoIds[index];

          return (
            <TodoRow
              key={todoId}
              id={todoId}
              style={style}
              onToggleTodo={onToggleTodo}
              onDeleteTodo={onDeleteTodo}
              onSelectTodo={() => setSelectedTodoId(todoId)}
            />
          );
        }}
      />

      <SheetDialog
        isOpen={selectedTodo !== null}
        onClose={() => setSelectedTodoId(null)}
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
            }}
          />
        )}
      </SheetDialog>
    </>
  );
};

export default TodoList;
