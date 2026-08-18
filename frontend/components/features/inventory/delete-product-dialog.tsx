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
import { useDeleteProduct } from "@/hooks/use-products";
import { ApiRequestError } from "@/lib/api/client";
import type { Product } from "@/types";

export function DeleteProductDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const deleteProduct = useDeleteProduct();

  async function handleDelete() {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success(`${product.name} deleted`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not delete product.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="icon-sm" />}>
        <Trash2 />
        <span className="sr-only">Delete {product.name}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {product.name}?</DialogTitle>
          <DialogDescription>
            This removes the product and its stock-movement history. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteProduct.isPending}>
            {deleteProduct.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
