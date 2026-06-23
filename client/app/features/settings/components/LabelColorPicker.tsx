"use client";

import { cn } from "@/lib/utils/tailwindMerge";
import { DEFAULT_LABEL_COLORS } from "../constants";

type LabelColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  style?: string;
};

const LabelColorPicker = ({
  value,
  onChange,
  style,
}: LabelColorPickerProps) => {
  return (
    <div className={cn("flex flex-wrap gap-1.5", style)}>
      {DEFAULT_LABEL_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "h-5 w-5 rounded-full border-2 transition-transform hover:scale-110",
            value === color ? "border-foreground" : "border-transparent",
          )}
          style={{ backgroundColor: color }}
          aria-label={`Pick color ${color}`}
        />
      ))}
    </div>
  );
};

export default LabelColorPicker;
