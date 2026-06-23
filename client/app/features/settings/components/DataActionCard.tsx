import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type DataActionCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
};

const DataActionCard = ({
  icon: Icon,
  title,
  description,
  actionLabel,
}: DataActionCardProps) => {
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">{title}</p>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <Button size="sm" variant="outline">
        {actionLabel}
      </Button>
    </div>
  );
};

export default DataActionCard;
