import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InlineSpinner } from "@/components/site/PageLoader";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  loading = false,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !loading && onOpenChange(nextOpen)}>
      <AlertDialogContent className="max-w-md border-destructive/20 p-0 overflow-hidden">
        <AlertDialogHeader className="p-6 pb-3 text-left">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <AlertDialogTitle className="font-serif text-2xl font-normal">{title}</AlertDialogTitle>
          <AlertDialogDescription className="leading-6">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-t border-border bg-muted/30 p-4 sm:space-x-3">
          <AlertDialogCancel disabled={loading} className="mt-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <InlineSpinner />}
            Delete product
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
