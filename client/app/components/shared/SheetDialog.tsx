"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface SheetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  description?: string;
  isTitleHidden?: boolean;
}

const SheetDialog = ({
  isOpen,
  onClose,
  children,
  title = "",
  description = "",
  isTitleHidden = false,
}: SheetDialogProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-[600px] overflow-y-auto pt-20 sm:max-w-[90%] md:max-w-[500px] lg:max-w-[600px] lg:pt-6 xl:max-w-[700px]">
        <SheetHeader className="mb-7">
          {isTitleHidden ? (
            <VisuallyHidden>
              <SheetTitle>{title}</SheetTitle>
            </VisuallyHidden>
          ) : (
            <SheetTitle>{title}</SheetTitle>
          )}
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
};

export default SheetDialog;
