"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TodoList from "@/features/todos/components/TodoList";
import TodosHeader from "@/features/todos/components/TodosHeader";
import { useTodosPage } from "@/features/todos/hooks/useTodosPage";

const Todos = () => {
  const {
    state: { todos, newTodoTitle, completedCount, activeCount },
    actions: {
      setNewTodoTitle,
      handleCreateTodo,
      handleToggleTodo,
      handleDeleteTodo,
      handleUpdateTodoTitle,
      handleSubtaskCountChange,
    },
  } = useTodosPage();

  return (
    <div className="flex w-full flex-col gap-6">
      <TodosHeader
        totalCount={todos.length}
        activeCount={activeCount}
        completedCount={completedCount}
      />

      <Card className="rounded-2xl p-4 shadow-sm sm:p-5">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={handleCreateTodo}
        >
          <Input
            value={newTodoTitle}
            onChange={(event) => setNewTodoTitle(event.target.value)}
            placeholder="Add a new todo..."
            aria-label="New todo title"
            className="h-11 flex-1 rounded-xl bg-background px-4 text-sm"
          />
          <Button
            type="submit"
            size="lg"
            className="h-11 rounded-xl px-4 sm:min-w-32"
          >
            <Plus className="size-4" />
            Add todo
          </Button>
        </form>
      </Card>

      <TodoList
        todos={todos}
        onToggleTodo={handleToggleTodo}
        onDeleteTodo={handleDeleteTodo}
        onUpdateTodoTitle={handleUpdateTodoTitle}
        handleSubtaskCountChange={handleSubtaskCountChange}
      />
    </div>
  );
};

export default Todos;
