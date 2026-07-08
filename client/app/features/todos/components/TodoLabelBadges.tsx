import { cn } from "@/lib/utils/tailwindMerge";
import type { TodoLabel } from "@/types/todo";
import { X } from "lucide-react";

const MAX_VISIBLE = 3;

type TodoLabelBadgesProps = {
  labels: TodoLabel[];
  className?: string;
};

export function MutableTodoBadge({
  label,
  onRemove,
}: {
  label: TodoLabel;
  onRemove: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-full border px-2",
        "text-xs font-medium tracking-wide",
      )}
      style={{
        borderColor: `${label.color}40`,
        color: label.color,
      }}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: label.color }}
        aria-hidden
      />
      {label.name}
      <button
        type="button"
        aria-label={`Remove ${label.name}`}
        className="ml-0.5 rounded-full hover:text-destructive cursor-pointer"
        onClick={onRemove}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

export function TodoLabelBadge({ label }: { label: TodoLabel }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-full border px-2",
        "text-xs font-medium tracking-wide",
      )}
      style={{
        borderColor: `${label.color}40`,
        color: label.color,
      }}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: label.color }}
        aria-hidden
      />
      {label.name}
    </span>
  );
}

export function TodoLabelBadges({ labels, className }: TodoLabelBadgesProps) {
  if (!labels.length) return null;

  const visible = labels.slice(0, MAX_VISIBLE);
  const overflow = labels.length - visible.length;

  return (
    <div
      data-todo-labels=""
      className={cn("flex min-w-0 flex-wrap items-center gap-1", className)}
    >
      {visible.map((label) => (
        <TodoLabelBadge key={label.id} label={label} />
      ))}
      {overflow > 0 && (
        <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
          +{overflow}
        </span>
      )}
    </div>
  );
}
