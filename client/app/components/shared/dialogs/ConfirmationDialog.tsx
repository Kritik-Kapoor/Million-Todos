import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

type ConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  callbackFn: () => void;
  description?: React.ReactNode;
  type?: string;
  isLoading?: boolean;
  title?: string;
  btnText: string;
  size?: "default" | "sm" | "lg" | "icon";
};

const ConfirmationDialog = ({
  isOpen,
  onClose,
  callbackFn,
  description = "This action cannot be undone!",
  type = "delete",
  isLoading,
  title = "Are you sure?",
  btnText,
  size = "default",
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-2">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="submit"
            onClick={callbackFn}
            variant={type === "delete" ? "destructive" : "default"}
            disabled={isLoading}
            size={size}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            {type === "delete"
              ? `Delete ${btnText}`
              : type === "send"
                ? `Send ${btnText}`
                : `Confirm ${btnText}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
