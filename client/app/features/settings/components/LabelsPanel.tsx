"use client";

import CreateLabelForm from "./CreateLabelForm";
import LabelListItem from "./LabelListItem";
import PanelHeader from "./PanelHeader";
import { useLabelsSection } from "../hooks/useLabelsPanel";

const LabelsPanel = () => {
  const {
    state: { labels, labelsPending, labelsError, creatingLabel },
    actions: { handleCreate, handleUpdate, deleteLabel },
  } = useLabelsSection();

  if (labelsPending) {
    return (
      <div className="space-y-6">
        <PanelHeader
          title="Labels"
          description="Create labels to organize and filter your todos."
        />
        <p className="text-sm text-muted-foreground">Loading labels…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Labels"
        description="Create labels to organize and filter your todos."
      />

      {labelsError && <p className="text-sm text-destructive">{labelsError}</p>}

      <CreateLabelForm onCreate={handleCreate} creatingLabel={creatingLabel} />

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Your labels ({labels.length})
        </p>
        {labels.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No labels yet. Create one above to get started.
          </div>
        ) : (
          <ul className="space-y-2">
            {labels.map((label) => (
              <LabelListItem
                key={label.id}
                label={label}
                onUpdate={handleUpdate}
                onDelete={() => deleteLabel(label.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LabelsPanel;
