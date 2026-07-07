import { cn } from "@/lib/utils/tailwindMerge";
import { format } from "date-fns";
import { Clock } from "lucide-react";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

function DueDateBadge({ dueDate }: { dueDate: string }) {
  const date = new Date(dueDate);
  const now = new Date();
  const isOverdue = date < now;
  const isDueSoon = !isOverdue && date.getTime() - now.getTime() < SIX_HOURS_MS;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs italic",
        isOverdue
          ? "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
          : isDueSoon
            ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
            : "bg-muted text-muted-foreground",
      )}
    >
      <Clock className="size-3" />
      <span>
        {isOverdue ? "Overdue · " : isDueSoon ? "Due soon · " : ""}
        {format(date, "MMM d, h:mm a")}
      </span>
    </div>
  );
}

export default DueDateBadge;
