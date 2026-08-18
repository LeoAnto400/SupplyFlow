"use client";

import { Boxes } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddSupplierProductDialog } from "./add-supplier-product-dialog";
import { EditSupplierProductDialog } from "./edit-supplier-product-dialog";
import { DeleteSupplierProductDialog } from "./delete-supplier-product-dialog";
import { useSupplierProducts } from "@/hooks/use-suppliers";
import { useProducts } from "@/hooks/use-products";
import type { Supplier } from "@/types";

export function SupplierProductsSheet({ supplier }: { supplier: Supplier }) {
  const { data: terms, isPending, isError } = useSupplierProducts(supplier.id);
  const { data: products } = useProducts();

  function productLabel(productId: string): string {
    const product = products?.find((candidate) => candidate.id === productId);
    return product ? `${product.name} (${product.sku})` : productId;
  }

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="icon-sm" />}>
        <Boxes />
        <span className="sr-only">Manage product terms for {supplier.name}</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{supplier.name} — product terms</SheetTitle>
          <SheetDescription>
            Price, lead time, and reliability per product — what the deterministic supplier ranking
            reads.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <div>
            <AddSupplierProductDialog supplierId={supplier.id} />
          </div>

          {isPending && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          )}

          {isError && <p className="text-sm text-destructive">Couldn&apos;t load product terms.</p>}

          {!isPending && !isError && terms && terms.length === 0 && (
            <p className="text-sm text-muted-foreground">No product terms yet.</p>
          )}

          {!isPending && !isError && terms && terms.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Lead time</TableHead>
                  <TableHead>Min qty</TableHead>
                  <TableHead>Reliability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {terms.map((term) => {
                  const label = productLabel(term.productId);
                  return (
                    <TableRow key={term.id}>
                      <TableCell className="font-medium">{label}</TableCell>
                      <TableCell>{term.price}</TableCell>
                      <TableCell>{term.leadTimeDays}d</TableCell>
                      <TableCell>{term.minOrderQty}</TableCell>
                      <TableCell>{term.reliabilityScore}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <EditSupplierProductDialog
                            supplierId={supplier.id}
                            term={term}
                            productLabel={label}
                          />
                          <DeleteSupplierProductDialog
                            supplierId={supplier.id}
                            termId={term.id}
                            productLabel={label}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
