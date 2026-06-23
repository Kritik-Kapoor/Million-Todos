import { Download, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import DataActionCard from "./DataActionCard";
import PanelHeader from "./PanelHeader";

const DataPanel = () => {
  return (
    <div className="space-y-6">
      <PanelHeader
        title="Data"
        description="Export, import, or clear your todos."
      />
      <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
        <DataActionCard
          icon={Download}
          title="Export todos"
          description="Download all your todos as a JSON file."
          actionLabel="Export"
        />
        <DataActionCard
          icon={Upload}
          title="Import todos"
          description="Bring in todos from a JSON file."
          actionLabel="Import"
        />
      </div>
      <Separator />
      <div className="space-y-2">
        <p className="text-sm font-medium">Clear all todos</p>
        <p className="text-xs text-muted-foreground">
          Permanently remove every todo from your account.
        </p>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
          Clear todos
        </Button>
      </div>
    </div>
  );
};

export default DataPanel;
