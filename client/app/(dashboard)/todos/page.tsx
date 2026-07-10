"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Plus, Loader2, Search, SlidersHorizontal } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge, getLabelBadgeVariant } from "@/components/ui/badge";
import MultiSelectCount from "@/components/shared/inputs/MultiSelectCount";
import SingleSelect from "@/components/shared/inputs/SingleSelect";
import TodoList from "@/features/todos/components/TodoList";
import TodosHeader from "@/features/todos/components/TodosHeader";
import { useTodosPage } from "@/features/todos/hooks/useTodosPage";
import { Field } from "@/components/ui/field";
import { DateTimePicker } from "@/components/shared/inputs/date-time-picker";
import type { TodoFilters } from "@/features/todos/api";
import { type DueDateFilter } from "@/features/todos/utils/dueDateFilterRange";
import { useDebounce } from "@/hooks/useDebounce";

const DUE_DATE_FILTER_OPTIONS: SelectOption[] = [
  { label: "Any due date", value: "any" },
  { label: "Today", value: "today" },
  { label: "Upcoming week", value: "upcoming_week" },
  { label: "Past week", value: "past_week" },
  { label: "Overdue", value: "overdue" },
];

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
      isUpdatingTodoDueDate,
      isUpdatingTodoLabels,
      isFiltering,
      isLoadingFilters,
      filters,
      filteredTodoIds,
    },
    actions: {
      handleCreateTodo,
      handleToggleTodo,
      handleDeleteTodo,
      handleTodoMetaDataChange,
      handleSubtaskCountChange,
      applyFilters,
      clearFilters,
    },
  } = useTodosPage();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const filtersRef = useRef(filters);
  const isSearchEffectReady = useRef(false);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const updateFilter = useCallback(
    (patch: Partial<TodoFilters>) => {
      applyFilters({
        ...filtersRef.current,
        ...patch,
      });
    },
    [applyFilters],
  );

  useEffect(() => {
    if (!isSearchEffectReady.current) {
      isSearchEffectReady.current = true;
      return;
    }

    applyFilters({
      ...filtersRef.current,
      search: debouncedSearch.trim() || undefined,
    });
  }, [debouncedSearch, applyFilters]);

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    clearFilters();
  }, [clearFilters]);

  const activeFilterCount = [
    searchInput.trim(),
    filters.labelIds?.length,
    filters.dueDate,
  ].filter(Boolean).length;

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

      <Card className="rounded-2xl p-3 shadow-sm sm:p-4 gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search todos..."
              className="h-11 rounded-xl pl-9 text-sm"
            />
          </div>

          <MultiSelectCount
            options={labelOptions}
            selected={labelOptions.filter((o) =>
              filters.labelIds?.includes(o.value),
            )}
            onChange={(opts) =>
              updateFilter({
                labelIds: opts.length ? opts.map((o) => o.value) : undefined,
              })
            }
            placeholder="Filter by labels"
            searchPlaceholder="Search labels..."
            emptyMessage="No labels found."
            selectedLabel="labels"
            loading={fetchingLabels}
            className="sm:w-44"
          />

          <SingleSelect
            placeholder="Filter by due date"
            options={DUE_DATE_FILTER_OPTIONS}
            value={filters.dueDate ?? "any"}
            onValueChange={(value) =>
              updateFilter({
                dueDate: value === "any" ? undefined : (value as DueDateFilter),
              })
            }
            className="flex w-full h-11! rounded-xl sm:w-44"
          />

          {activeFilterCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 shrink-0 gap-1.5 rounded-lg text-xs text-muted-foreground"
              onClick={handleClearFilters}
            >
              <X className="size-3.5" />
              Clear
              <Badge variant="secondary" className="text-[10px]">
                {activeFilterCount}
              </Badge>
            </Button>
          )}

          {isLoadingFilters && (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          )}
        </div>

        {isFiltering && !isLoadingFilters && (
          <p className="text-xs text-muted-foreground">
            <SlidersHorizontal className="mr-1 inline size-3" />
            Showing {filteredTodoIds?.length} filtered{" "}
            {filteredTodoIds?.length === 1 ? "todo" : "todos"}
          </p>
        )}
      </Card>

      <TodoList
        todoIds={filteredTodoIds ?? todoIds}
        labelOptions={labelOptions}
        fetchingLabels={fetchingLabels}
        isUpdatingTodoDueDate={isUpdatingTodoDueDate}
        isUpdatingTodoLabels={isUpdatingTodoLabels}
        onToggleTodo={handleToggleTodo}
        onDeleteTodo={handleDeleteTodo}
        onTodoMetaDataChange={handleTodoMetaDataChange}
        handleSubtaskCountChange={handleSubtaskCountChange}
      />
    </div>
  );
};

export default Todos;
