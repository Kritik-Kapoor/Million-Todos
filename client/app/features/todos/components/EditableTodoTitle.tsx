"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
    if (trimmed !== title) {
      onSave(trimmed);
    }
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
    <button
      type="button"
      onClick={startEdit}
      className={cn(
        "w-full truncate text-left text-lg font-semibold hover:opacity-80",
        className,
      )}
    >
      {title}
    </button>
  );
};

export default EditableTodoTitle;
