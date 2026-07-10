"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/tailwindMerge";
import { Pen } from "lucide-react";
import { Button } from "@/components/ui/button";

type EditableTodoTitleProps = {
  title: string;
  onSave: (title: string) => void;
  className?: string;
};

const EditableTodoTitle = ({
  title,
  onSave,
  className,
}: EditableTodoTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEdit = () => {
    setDraftTitle(title);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftTitle(title);
    setIsEditing(false);
  };

  const commitEdit = () => {
    const trimmed = draftTitle.trim();
    if (!trimmed) {
      cancelEdit();
      return;
    }

    setIsEditing(false);
    if (trimmed !== title) onSave(trimmed);
    else cancelEdit();
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draftTitle}
        onChange={(e) => setDraftTitle(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitEdit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            cancelEdit();
          }
        }}
        className={cn(
          "w-full bg-transparent text-lg font-semibold outline-none",
          className,
        )}
        aria-label="Edit todo title"
      />
    );
  }

  return (
    <div
      className={cn(
        "group w-full flex items-center gap-3 truncate text-left text-lg font-semibold hover:opacity-80",
        className,
      )}
    >
      {title}{" "}
      <Button variant="ghost" size="icon" onClick={startEdit}>
        <Pen className="size-4 text-blue-500 hidden group-hover:block" />
      </Button>
    </div>
  );
};

export default EditableTodoTitle;
