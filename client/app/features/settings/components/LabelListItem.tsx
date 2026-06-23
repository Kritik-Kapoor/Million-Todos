"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LabelItem } from "../types";
import LabelColorPicker from "./LabelColorPicker";

type LabelListItemProps = {
  label: LabelItem;
  onUpdate: (label: LabelItem) => Promise<void>;
  onDelete: () => void;
};

const LabelListItem = ({ label, onUpdate, onDelete }: LabelListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(label.name);
  const [editColor, setEditColor] = useState(label.color);

  const startEdit = () => {
    setEditName(label.name);
    setEditColor(label.color);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditName(label.name);
    setEditColor(label.color);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName) return;

    const isNameUpdated = trimmedName !== label.name;
    const isColorUpdated = editColor !== label.color;
    if (!isNameUpdated && !isColorUpdated) return;

    try {
      await onUpdate({ ...label, name: trimmedName, color: editColor });
      setIsEditing(false);
    } catch {
      // Error surfaced by useLabelsSection
      console.error("Failed to update label");
    }
  };

  return (
    <li className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
      {isEditing ? (
        <div className="w-full space-y-2">
          <div className="flex items-center gap-3 w-full">
            <span
              className="h-4 w-4 shrink-0 rounded-full border"
              style={{ backgroundColor: editColor }}
            />
            <Input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className="h-8"
            />

            <Button size="icon" variant="ghost" onClick={saveEdit}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={cancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <LabelColorPicker
            value={editColor}
            onChange={setEditColor}
            style="ml-8"
          />
        </div>
      ) : (
        <>
          <span
            className="h-4 w-4 shrink-0 rounded-full border"
            style={{ backgroundColor: label.color }}
          />
          <span className="flex-1 text-sm font-medium">{label.name}</span>
          <Button size="icon" variant="ghost" onClick={startEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </>
      )}
    </li>
  );
};

export default LabelListItem;
