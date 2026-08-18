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
import { useDeleteSupplierProduct } from "@/hooks/use-suppliers";
import { ApiRequestError } from "@/lib/api/client";

export function DeleteSupplierProductDialog({
  supplierId,
  termId,
  productLabel,
}: {
  supplierId: string;
  termId: string;
  productLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const deleteSupplierProduct = useDeleteSupplierProduct(supplierId);

  async function handleDelete() {
    try {
      await deleteSupplierProduct.mutateAsync(termId);
      toast.success("Product terms removed");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not remove product terms.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="icon-sm" />}>
        <Trash2 />
        <span className="sr-only">Remove terms for {productLabel}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove terms for {productLabel}?</DialogTitle>
          <DialogDescription>This can&apos;t be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteSupplierProduct.isPending}>
            {deleteSupplierProduct.isPending ? "Removing…" : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
