import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUiSettings } from "@/features/settings/context/UiSettingsContext";

const ROW_HEIGHT = 80;
const COMPACT_ROW_HEIGHT = 56;
const SKELETON_COUNT = 4;

const TodoListSkeleton = () => {
  const { density } = useUiSettings();
  const itemHeight = density === "compact" ? COMPACT_ROW_HEIGHT : ROW_HEIGHT;
  const isCompact = density === "compact";

  return (
    <div
      className="space-y-2 rounded-2xl"
      aria-busy="true"
      aria-label="Loading todos"
    >
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <Card
          key={index}
          className="flex flex-row items-center gap-3 rounded-2xl border border-border/70 px-4 shadow-sm"
          style={{ height: itemHeight }}
        >
          <Skeleton className="size-5 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col w-full gap-2">
            <Skeleton className="h-4 w-3/5 rounded-xl" />
            {!isCompact && (
              <div className="flex items-center gap-2">
                {Array.from({ length: 2 }, (_, index) => (
                  <Skeleton key={index} className="h-4 w-16 rounded-xl" />
                ))}
              </div>
            )}
          </div>
          <Skeleton className="hidden size-7 shrink-0 rounded-md sm:block" />
        </Card>
      ))}
    </div>
  );
};

export default TodoListSkeleton;
