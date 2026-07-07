import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/tailwindMerge";
import Image from "next/image";

type SingleSelectProps = {
  placeholder?: string;
  options: (SelectOption & {
    logo?: string;
    icon?: React.ReactNode;
    description?: string;
  })[];
  noDataFound?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  keyField?: string;
  showOptionsInTwoLine?: boolean;
  splitKey?: string;
};

const SingleSelect = ({
  placeholder,
  options = [],
  noDataFound = "No Data Found",
  value,
  onValueChange,
  disabled = false,
  className,
  keyField = "value",
  ...props
}: SingleSelectProps) => {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          (value == "" || value == "any") && "text-muted-foreground",
          className,
        )}
        disabled={disabled || options.length < 1}
        {...props}
      >
        <SelectValue placeholder={placeholder}>
          <span className="truncate">{selectedOption?.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.length > 0 ? (
          options.map((option) => (
            <SelectItem
              key={option[keyField] as string}
              value={option.value}
              className={cn(
                "cursor-pointer text-xs h-9",
                Boolean(option.disabled ?? false) && "cursor-not-allowed",
                Boolean(option.disabled ?? false) && "opacity-50",
              )}
              disabled={Boolean(option.disabled ?? false)}
            >
              <div className="flex items-center gap-2">
                {option.logo && <Image src={option.logo} alt="" width={25} />}
                {option.icon && option.icon}
                <span>{option.label}</span>
              </div>
              {option.description && (
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              )}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-data" disabled>
            {noDataFound}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default SingleSelect;
