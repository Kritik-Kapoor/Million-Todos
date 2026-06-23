"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_LABEL_COLORS } from "../constants";
import LabelColorPicker from "./LabelColorPicker";

type CreateLabelFormProps = {
  onCreate: (name: string, color: string) => Promise<void>;
  creatingLabel?: boolean;
};

const CreateLabelForm = ({
  onCreate,
  creatingLabel = false,
}: CreateLabelFormProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_LABEL_COLORS[0]);

  const handleAdd = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || creatingLabel) return;

    try {
      await onCreate(trimmedName, color);
      setName("");
      setColor(DEFAULT_LABEL_COLORS[0]);
    } catch {
      // Error surfaced by useLabelsSection
      console.error("Failed to create label");
    }
  };

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <Label className="text-sm">New label</Label>
      <div className="flex gap-2">
        <Input
          placeholder="e.g. Work, Personal, Urgent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          disabled={creatingLabel}
        />
        <Button onClick={handleAdd} disabled={creatingLabel || !name.trim()}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      <LabelColorPicker value={color} onChange={setColor} />
    </div>
  );
};

export default CreateLabelForm;
