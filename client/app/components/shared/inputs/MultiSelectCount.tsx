import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/tailwindMerge";

export interface MultiSelectCountProps {
  options: SelectOption[];
  selected: SelectOption[];
  onChange: (values: SelectOption[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
  selectedLabel?: string;
}

const MultiSelectCount = ({
  options,
  selected = [],
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search items...",
  emptyMessage = "No items found.",
  disabled = false,
  className,
  loading = false,
  selectedLabel = "Resources",
}: MultiSelectCountProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const toggleOption = (option: SelectOption) => {
    if (option.isGroupHeader || option.isGroupEmpty) return;
    const nextSelected = selected.some((item) => item.value === option.value)
      ? selected.filter((item) => item.value !== option.value)
      : [...selected, option];
    onChange(nextSelected);
  };

  const filteredOptions = useMemo(() => {
    if (searchValue.trim() === "") return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase().trim()),
    );
  }, [options, searchValue]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (loading && !nextOpen) return;
    setOpen(nextOpen);
  };

  const selectedCountText =
    selected.length > 0
      ? `${selected.length} ${selectedLabel} selected`
      : placeholder;

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-11! w-full justify-between rounded-xl",
              selected.length === 0 && "text-muted-foreground",
            )}
            disabled={disabled}
            type="button"
          >
            <span className="truncate">{selectedCountText}</span>
            {open ? (
              <ChevronUp className="h-4 w-4 shrink-0 opacity-50" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverPrimitive.Content
          className="z-50 w-[--radix-popover-trigger-width] rounded-md border bg-popover p-0 text-popover-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          align="start"
          sideOffset={4}
        >
          <Command className="w-full" shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-9"
              value={searchValue}
              onValueChange={(value) => setSearchValue(value.trim())}
            />
            <CommandList className="max-h-[220px] overflow-auto">
              {loading ? (
                <div className="item-center flex justify-center py-3">
                  <Loader2 className="animate-spin text-gray-300" />
                </div>
              ) : filteredOptions.length > 0 ? (
                <CommandGroup className="p-0 mt-1">
                  {filteredOptions.map((option) => {
                    if (option.isGroupHeader) {
                      return (
                        <div
                          key={option.value}
                          className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-gray-100"
                        >
                          {option.label}
                        </div>
                      );
                    }

                    if (option.isGroupEmpty) {
                      return (
                        <div
                          key={option.value}
                          className="px-2 py-1.5 text-xs italic text-muted-foreground"
                        >
                          {option.label}
                        </div>
                      );
                    }

                    const isChecked = selected.some(
                      (item) => item.value === option.value,
                    );

                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => toggleOption(option)}
                        className="text-xs"
                      >
                        <div className="flex w-full items-center gap-2">
                          <span
                            className={cn(
                              "flex size-4 shrink-0 items-center justify-center rounded-sm border border-pink-400",
                              isChecked && "bg-pink-400 text-white",
                            )}
                          >
                            {isChecked && (
                              <Check className="size-4 text-white" />
                            )}
                          </span>
                          <span>{option.label}</span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : (
                <div className="py-3 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverPrimitive.Content>
      </Popover>
    </div>
  );
};

export default MultiSelectCount;
