"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

type NotificationToggleRowProps = {
  title: string;
  description: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  upcomingFeature?: boolean;
};

const NotificationToggleRow = ({
  title,
  description,
  checked = false,
  onChange,
  disabled = false,
  upcomingFeature = false,
}: NotificationToggleRowProps) => {
  const handleChange = (checked: boolean) => {
    onChange?.(checked);
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
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
