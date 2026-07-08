import { useState, useMemo } from "react";
import { format, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils/tailwindMerge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "./TimePicker";
import { Separator } from "@/components/ui/separator";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  /** Called once when the popover closes — use this to avoid firing on every intermediate change. */
  onCommit?: (date: Date | undefined) => void;
  placeholder?: string;
  minDateTime?: Date;
  maxDateTime?: Date;
  disabled?: boolean;
  className?: string;
  contentWidth?: string;
}

export function DateTimePicker({
  value,
  onChange,
  onCommit,
  placeholder = "Pick a date & time",
  minDateTime,
  maxDateTime,
  disabled = false,
  className,
  contentWidth = "200px",
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(value);
  const [time, setTime] = useState<Date | undefined>(value);

  const disabledDays = useMemo(() => {
    const matchers: Array<{ before: Date } | { after: Date }> = [];
    if (minDateTime) matchers.push({ before: startOfDay(minDateTime) });
    if (maxDateTime) matchers.push({ after: startOfDay(maxDateTime) });
    return matchers.length > 0 ? matchers : undefined;
  }, [minDateTime, maxDateTime]);

  function buildCombined(d: Date | undefined, t: Date | undefined) {
    if (!d) return undefined;
    const result = new Date(d);
    result.setHours(t ? t.getHours() : 0, t ? t.getMinutes() : 0, 0, 0);
    return result;
  }

  const combined = useMemo(() => buildCombined(date, time), [date, time]);

  const handleDateChange = (d: Date | undefined) => {
    setDate(d);
    onChange?.(buildCombined(d, time));
  };

  const handleTimeChange = (t: Date | undefined) => {
    setTime(t);
    onChange?.(buildCombined(date, t));
  };

  const handleReset = () => {
    setDate(undefined);
    setTime(undefined);
    setOpen(false);
    onChange?.(undefined);
    // Fire onCommit directly — Radix won't trigger onOpenChange for a
    // programmatic setOpen(false), so we must call it here explicitly.
    onCommit?.(undefined);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    // Popover is closing via user gesture (click-outside / Escape).
    if (!next && onCommit) {
      onCommit(buildCombined(date, time));
    }
  };

  const displayLabel = combined
    ? format(combined, "MMM dd, y  hh:mm a")
    : undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className={cn(
              "h-11 w-full justify-start text-left font-normal rounded-xl",
              !displayLabel && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayLabel ?? <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="flex w-auto flex-col gap-3"
          align="start"
          style={{ minWidth: contentWidth }}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            defaultMonth={date}
            disabled={disabledDays}
          />
          <Separator />
          <TimePicker date={time} setDate={handleTimeChange} />
          <Separator />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hover:bg-primary!"
            onClick={handleReset}
            disabled={!date && !time}
          >
            Reset
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
