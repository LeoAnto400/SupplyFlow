"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateSupplierDialog } from "@/components/features/suppliers/create-supplier-dialog";
import { EditSupplierDialog } from "@/components/features/suppliers/edit-supplier-dialog";
import { DeleteSupplierDialog } from "@/components/features/suppliers/delete-supplier-dialog";
import { SupplierProductsSheet } from "@/components/features/suppliers/supplier-products-sheet";
import { useSuppliers } from "@/hooks/use-suppliers";
import { ApiRequestError } from "@/lib/api/client";

export default function SuppliersPage() {
  const { data: suppliers, isPending, isError, error } = useSuppliers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
        <CreateSupplierDialog />
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load suppliers</AlertTitle>
          <AlertDescription>
            {error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {isPending && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      )}

      {!isPending && !isError && suppliers && suppliers.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No suppliers yet. Add one to start recording contract terms.
        </p>
      )}

      {!isPending && !isError && suppliers && suppliers.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact email</TableHead>
              <TableHead>Contact phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell className="text-muted-foreground">{supplier.contactEmail ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{supplier.contactPhone ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <SupplierProductsSheet supplier={supplier} />
                    <EditSupplierDialog supplier={supplier} />
                    <DeleteSupplierDialog supplier={supplier} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
