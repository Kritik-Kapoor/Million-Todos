"use client";

import MultiSelectCount from "@/components/shared/inputs/MultiSelectCount";
import { DateTimePicker } from "@/components/shared/inputs/date-time-picker";
import type { Todo, TodoLabel } from "@/types/todo";
import { MutableTodoBadge } from "./TodoLabelBadges";

type TodoDialogMetaProps = {
  todo: Todo;
  labelOptions: SelectOption[];
  fetchingLabels: boolean;
  isUpdatingDueDate: boolean;
  isUpdatingLabels: boolean;
  onDueDateChange: (todoId: string, dueDate: Date | null) => void;
  onLabelsChange: (todoId: string, labelIds: string[]) => void;
};

function labelsToOptions(labels: TodoLabel[]): SelectOption[] {
  return labels.map((label) => ({
    value: label.id,
    label: label.name,
    color: label.color,
  }));
}

const TodoDialogMeta = ({
  todo,
  labelOptions,
  fetchingLabels,
  isUpdatingDueDate,
  isUpdatingLabels,
  onDueDateChange,
  onLabelsChange,
}: TodoDialogMetaProps) => {
  const selectedLabelOptions = labelsToOptions(todo.labels ?? []);

  const handleDueDateChange = (date: Date | undefined) => {
    const next = date?.toISOString() ?? null;
    const current = todo.dueDate ?? null;
    if (next === current) return;
    onDueDateChange(todo.id, date ?? null);
  };

  const handleLabelsChange = (options: SelectOption[]) => {
    const nextIds = options
      .map((o) => o.value)
      .sort()
      .join(",");
    const currentIds = selectedLabelOptions
      .map((o) => o.value)
      .sort()
      .join(",");
    if (nextIds === currentIds) return;

    onLabelsChange(
      todo.id,
      options.map((o) => o.value),
    );
  };

  const removeLabel = (labelId: string) => {
    onLabelsChange(
      todo.id,
      selectedLabelOptions
        .filter((o) => o.value !== labelId)
        .map((o) => o.value),
    );
  };

  return (
    <div className="flex flex-col gap-3 px-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <DateTimePicker
          key={`${todo.id}-due-${todo.dueDate ?? "none"}`}
          value={todo.dueDate ? new Date(todo.dueDate) : undefined}
          onCommit={handleDueDateChange}
          placeholder="Add due date"
          disabled={isUpdatingDueDate}
          className="flex-1"
          contentWidth="300px"
        />
        <MultiSelectCount
          options={labelOptions}
          selected={selectedLabelOptions}
          onChange={handleLabelsChange}
          placeholder="Assign labels"
          searchPlaceholder="Search labels..."
          emptyMessage="No labels found."
          selectedLabel="labels"
          loading={fetchingLabels}
          disabled={isUpdatingLabels}
          className="flex-1"
        />
      </div>

      {todo.labels && todo.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {todo.labels.map((label) => (
            <MutableTodoBadge
              key={label.id}
              label={label}
              onRemove={() => removeLabel(label.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoDialogMeta;
