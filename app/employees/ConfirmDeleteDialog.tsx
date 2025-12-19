"use client";

import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";

export function ConfirmDeleteDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogHeader>
        <DialogTitle>{props.title}</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="text-sm text-zinc-600">{props.description}</div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={() => props.onOpenChange(false)} type="button">
          Скасувати
        </Button>
        <Button variant="destructive" disabled={props.loading} onClick={() => void props.onConfirm()} type="button">
          {props.confirmLabel ?? "Видалити"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
