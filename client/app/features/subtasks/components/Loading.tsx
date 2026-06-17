import { Skeleton } from "@/components/ui/skeleton";

const SubtaskListSkeleton = ({
  height,
  rowHeight,
}: {
  height: number;
  rowHeight: number;
}) => {
  const SKELETON_ROW_COUNT = Math.ceil(height / rowHeight);

  return (
    <div className="flex flex-col gap-0 rounded-xl" style={{ height }}>
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
        <div key={i} className="px-1 py-1" style={{ height: rowHeight }}>
          <div className="flex h-full items-center gap-3 rounded-xl border border-border/60 px-4">
            <Skeleton className="size-4 shrink-0" />
            <Skeleton className="size-4 shrink-0 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubtaskListSkeleton;
