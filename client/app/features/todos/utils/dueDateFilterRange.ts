export type DueDateFilter = "today" | "upcoming_week" | "past_week" | "overdue";

export type DueDateFilterRange = {
  from?: string;
  to?: string;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function dueDateFilterToRange(
  filter: DueDateFilter,
): DueDateFilterRange {
  const now = new Date();
  const startOfToday = startOfDay(now);

  switch (filter) {
    case "today":
      return {
        from: startOfToday.toISOString(),
        to: addDays(startOfToday, 1).toISOString(),
      };
    case "upcoming_week":
      return {
        from: addDays(startOfToday, 1).toISOString(),
        to: addDays(startOfToday, 8).toISOString(),
      };
    case "past_week":
      return {
        from: addDays(startOfToday, -7).toISOString(),
        to: startOfToday.toISOString(),
      };
    case "overdue":
      return { to: now.toISOString() };
  }
}
