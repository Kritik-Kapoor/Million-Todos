import { Card } from "@/components/ui/card";

type TodosHeaderProps = {
  totalCount: number;
  activeCount: number;
  completedCount: number;
};

const TodosHeader = ({
  totalCount,
  activeCount,
  completedCount,
}: TodosHeaderProps) => (
  <section className="overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-primary/10 via-background to-muted/50 p-6 shadow-sm sm:p-8">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Million Todos
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Today&apos;s focus
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Capture tasks quickly, track what is still active, and clear the
          <br />
          list as you finish.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:min-w-80">
        <Card className="min-w-[140px] gap-1 rounded-2xl p-4 text-center">
          <span className="text-2xl font-semibold tabular-nums">
            {totalCount}
          </span>
          <span className="text-muted-foreground">Total</span>
        </Card>
        <Card className="min-w-[140px] gap-1 rounded-2xl p-4 text-center">
          <span className="text-2xl font-semibold tabular-nums">
            {activeCount}
          </span>
          <span className="text-muted-foreground">Active</span>
        </Card>
        <Card className="min-w-[140px] gap-1 rounded-2xl p-4 text-center">
          <span className="text-2xl font-semibold tabular-nums">
            {completedCount}
          </span>
          <span className="text-muted-foreground">Done</span>
        </Card>
      </div>
    </div>
  </section>
);

export default TodosHeader;
