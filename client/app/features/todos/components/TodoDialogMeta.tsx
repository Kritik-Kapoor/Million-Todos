"use client";

import MultiSelectCount from "@/components/shared/inputs/MultiSelectCount";
import { DateTimePicker } from "@/components/shared/inputs/date-time-picker";
import type {
  Todo,
  TodoLabel,
  TodoMetaDataChangeDataParams,
} from "@/types/todo";
import { MutableTodoBadge } from "./TodoLabelBadges";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/tailwindMerge";

type TodoDialogMetaProps = {
  todo: Todo;
  labelOptions: SelectOption[];
  fetchingLabels: boolean;
  isUpdatingDueDate: boolean;
  isUpdatingLabels: boolean;
  onTodoMetaDataChange: (params: TodoMetaDataChangeDataParams) => void;
};

const MAX_DESCRIPTION_LENGTH = 300;

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
  onTodoMetaDataChange,
}: TodoDialogMetaProps) => {
  const descriptionEditorRef = useRef<HTMLDivElement>(null);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [description, setDescription] = useState(todo.description ?? "");

  const selectedLabelOptions = useMemo(
    () => labelsToOptions(todo.labels ?? []),
    [todo.labels],
  );

  const handleDueDateChange = (date: Date | undefined) => {
    const next = date?.toISOString() ?? null;
    const current = todo.dueDate ?? null;
    if (next === current) return;
    onTodoMetaDataChange({
      id: todo.id,
      updateFields: "dueDate",
      data: { dueDate: date ?? null },
    });
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

    onTodoMetaDataChange({
      id: todo.id,
      updateFields: "labels",
      data: { labels: options.map((o) => o.value) },
    });
  };

  const removeLabel = (labelId: string) => {
    onTodoMetaDataChange({
      id: todo.id,
      updateFields: "labels",
      data: {
        labels: selectedLabelOptions
          .filter((o) => o.value !== labelId)
          .map((o) => o.value),
      },
    });
  };

  const handleDescriptionChange = (nextDescription: string) => {
    onTodoMetaDataChange({
      id: todo.id,
      updateFields: "description",
      data: { description: nextDescription },
    });
    setIsDescriptionFocused(false);
  };

  const cancelDescriptionEdit = () => {
    setDescription(todo.description ?? "");
    setIsDescriptionFocused(false);
  };

  const commitDescriptionEdit = () => {
    const trimmed = description.trim();
    const current = todo.description ?? "";
    if (trimmed !== current) handleDescriptionChange(trimmed);
    else cancelDescriptionEdit();
  };

  const handleDescriptionFocus = () => {
    setDescription(todo.description ?? "");
    setIsDescriptionFocused(true);
  };

  const handleDescriptionBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (descriptionEditorRef.current?.contains(e.relatedTarget)) return;
    cancelDescriptionEdit();
  };

  return (
    <div className="flex flex-col gap-3 px-5">
      <div ref={descriptionEditorRef} className="relative">
        <Textarea
          value={isDescriptionFocused ? description : (todo.description ?? "")}
          onChange={(e) => setDescription(e.target.value)}
          onFocus={handleDescriptionFocus}
          onBlur={handleDescriptionBlur}
          placeholder="Add description"
          maxLength={MAX_DESCRIPTION_LENGTH}
          className={cn(
            "min-h-24 resize-none pr-16",
            isDescriptionFocused && "pb-10",
          )}
        />

        {isDescriptionFocused && (
          <>
            <span className="absolute bottom-2 left-3 text-xs text-muted-foreground">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Cancel description edit"
                onClick={cancelDescriptionEdit}
              >
                <X className="size-4 text-red-500" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Save description"
                onClick={commitDescriptionEdit}
              >
                <Check className="size-4 text-green-500" />
              </Button>
            </div>
          </>
        )}
      </div>
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
