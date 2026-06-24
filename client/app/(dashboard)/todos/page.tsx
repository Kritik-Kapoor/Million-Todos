"use client";

import { X, Plus, Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge, getLabelBadgeVariant } from "@/components/ui/badge";
import MultiSelectCount from "@/components/shared/inputs/MultiSelectCount";
import TodoList from "@/features/todos/components/TodoList";
import TodosHeader from "@/features/todos/components/TodosHeader";
import { useTodosPage } from "@/features/todos/hooks/useTodosPage";
import { Field } from "@/components/ui/field";
import { DateTimePicker } from "@/components/shared/inputs/date-time-picker";

const Todos = () => {
  const {
    state: {
      todoIds,
      completedCount,
      activeCount,
      labelOptions,
      fetchingLabels,
      form,
      selectedLabels,
      isCreatingTodo,
    },
    actions: {
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
        totalCount={todoIds.length}
        activeCount={activeCount}
        completedCount={completedCount}
      />

      <Card className="rounded-2xl p-4 shadow-sm sm:p-5">
        <form
          className="flex flex-col gap-3"
          onSubmit={form.handleSubmit(handleCreateTodo)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              form.clearErrors();
            }
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1!">
                  <Input
                    {...field}
                    placeholder="Add a new todo..."
                    aria-label="New todo title"
                    aria-invalid={fieldState.invalid}
                    className="h-11 flex-1 rounded-xl bg-background px-4 text-sm"
                  />
                </Field>
              )}
            />

            <Controller
              name="dueDate"
              control={form.control}
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select due date"
                  className="sm:w-48 sm:min-w-44"
                />
              )}
            />

            <Controller
              name="selectedLabels"
              control={form.control}
              render={({ field }) => (
                <MultiSelectCount
                  options={labelOptions}
                  selected={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Assign labels"
                  searchPlaceholder="Search labels..."
                  emptyMessage="No labels found."
                  selectedLabel="labels"
                  loading={fetchingLabels}
                  className="sm:w-48"
                />
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="h-11 rounded-xl px-4 sm:min-w-32"
              disabled={isCreatingTodo}
            >
              {isCreatingTodo ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {isCreatingTodo ? "Adding..." : "Add todo"}
            </Button>
          </div>

          {selectedLabels && selectedLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedLabels.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    getLabelBadgeVariant(option.color as string) ?? "outline"
                  }
                  className="gap-1.5 pr-1 text-xs"
                >
                  {option.label}
                  <button
                    type="button"
                    aria-label={`Remove ${option.label}`}
                    className="ml-0.5 rounded-full hover:text-destructive"
                    onClick={() =>
                      form.setValue(
                        "selectedLabels",
                        selectedLabels.filter((l) => l.value !== option.value),
                      )
                    }
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </form>
      </Card>

      <TodoList
        todoIds={todoIds}
        onToggleTodo={handleToggleTodo}
        onDeleteTodo={handleDeleteTodo}
        onUpdateTodoTitle={handleUpdateTodoTitle}
        handleSubtaskCountChange={handleSubtaskCountChange}
      />
    </div>
  );
};

export default Todos;
