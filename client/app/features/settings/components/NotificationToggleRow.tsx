"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { InfoIcon } from "lucide-react";

type NotificationToggleRowProps = {
  title: string;
  description: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  upcomingFeature?: boolean;
  note?: string;
};

const NotificationToggleRow = ({
  title,
  description,
  checked = false,
  onChange,
  disabled = false,
  upcomingFeature = false,
  note = "",
}: NotificationToggleRowProps) => {
  const handleChange = (checked: boolean) => {
    onChange?.(checked);
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        {note && (
          <div className="flex items-center gap-1 mt-2 ">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <p className="text-xs">{note}</p>
          </div>
        )}
      </div>
      {upcomingFeature ? (
        <Badge variant="outline" className="text-xs">
          Upcoming feature
        </Badge>
      ) : (
        <Switch
          checked={checked}
          onCheckedChange={handleChange}
          disabled={disabled}
          className="cursor-pointer"
        />
      )}
    </div>
  );
};

export default NotificationToggleRow;
