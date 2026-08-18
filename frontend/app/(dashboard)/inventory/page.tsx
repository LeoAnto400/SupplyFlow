"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateProductDialog } from "@/components/features/inventory/create-product-dialog";
import { EditProductDialog } from "@/components/features/inventory/edit-product-dialog";
import { StockMovementDialog } from "@/components/features/inventory/stock-movement-dialog";
import { DeleteProductDialog } from "@/components/features/inventory/delete-product-dialog";
import { useProducts } from "@/hooks/use-products";
import { ApiRequestError } from "@/lib/api/client";

export default function InventoryPage() {
  const { data: products, isPending, isError, error } = useProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <CreateProductDialog />
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load products</AlertTitle>
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

      {!isPending && !isError && products.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No products yet. Add one to start tracking inventory.
        </p>
      )}

      {!isPending && !isError && products.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Low-stock threshold</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isLowStock = product.quantity < product.safetyThreshold;
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.quantity}
                      {isLowStock && <Badge variant="destructive">Low stock</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{product.safetyThreshold}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <StockMovementDialog product={product} />
                      <EditProductDialog product={product} />
                      <DeleteProductDialog product={product} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
