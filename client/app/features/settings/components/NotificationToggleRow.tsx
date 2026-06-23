"use client";

import { Switch } from "@/components/ui/switch";

type NotificationToggleRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

const NotificationToggleRow = ({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: NotificationToggleRowProps) => {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
};

export default NotificationToggleRow;
