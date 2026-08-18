"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteSupplier } from "@/hooks/use-suppliers";
import { ApiRequestError } from "@/lib/api/client";
import type { Supplier } from "@/types";

export function DeleteSupplierDialog({ supplier }: { supplier: Supplier }) {
  const [open, setOpen] = useState(false);
  const deleteSupplier = useDeleteSupplier();

  async function handleDelete() {
    try {
      await deleteSupplier.mutateAsync(supplier.id);
      toast.success(`${supplier.name} deleted`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not delete supplier.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="icon-sm" />}>
        <Trash2 />
        <span className="sr-only">Delete {supplier.name}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {supplier.name}?</DialogTitle>
          <DialogDescription>
            This can&apos;t be undone. Suppliers with product terms still attached can&apos;t be
            deleted — remove those first.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteSupplier.isPending}>
            {deleteSupplier.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
