"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateSupplierProduct } from "@/hooks/use-suppliers";
import { useProducts } from "@/hooks/use-products";
import { ApiRequestError } from "@/lib/api/client";

const schema = z.object({
  productId: z.string().min(1, "Select a product"),
  price: z.number().min(0, "Must be 0 or greater"),
  leadTimeDays: z.number().int().min(0, "Must be 0 or greater"),
  minOrderQty: z.number().int().min(1, "Must be at least 1"),
  reliabilityScore: z.number().min(0, "Must be between 0 and 100").max(100, "Must be between 0 and 100"),
});

type FormValues = z.infer<typeof schema>;

export function AddSupplierProductDialog({ supplierId }: { supplierId: string }) {
  const [open, setOpen] = useState(false);
  const { data: products } = useProducts();
  const createSupplierProduct = useCreateSupplierProduct(supplierId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // productId must start defined (not undefined) so the Select below is
    // controlled from the first render — otherwise Base UI warns about an
    // uncontrolled-to-controlled switch once a value is picked.
    defaultValues: { productId: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createSupplierProduct.mutateAsync(values);
      toast.success("Product terms added");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not add product terms.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <Plus />
        Add product terms
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add product terms</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.productId}>
              <FieldLabel htmlFor="productId">Product</FieldLabel>
              <Controller
                control={control}
                name="productId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="productId" className="w-full" aria-invalid={!!errors.productId}>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.productId]} />
            </Field>
            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="price">Price</FieldLabel>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                aria-invalid={!!errors.price}
                {...register("price", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.price]} />
            </Field>
            <Field data-invalid={!!errors.leadTimeDays}>
              <FieldLabel htmlFor="leadTimeDays">Lead time (days)</FieldLabel>
              <Input
                id="leadTimeDays"
                type="number"
                min={0}
                aria-invalid={!!errors.leadTimeDays}
                {...register("leadTimeDays", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.leadTimeDays]} />
            </Field>
            <Field data-invalid={!!errors.minOrderQty}>
              <FieldLabel htmlFor="minOrderQty">Minimum order quantity</FieldLabel>
              <Input
                id="minOrderQty"
                type="number"
                min={1}
                aria-invalid={!!errors.minOrderQty}
                {...register("minOrderQty", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.minOrderQty]} />
            </Field>
            <Field data-invalid={!!errors.reliabilityScore}>
              <FieldLabel htmlFor="reliabilityScore">Reliability score (0-100)</FieldLabel>
              <Input
                id="reliabilityScore"
                type="number"
                min={0}
                max={100}
                aria-invalid={!!errors.reliabilityScore}
                {...register("reliabilityScore", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.reliabilityScore]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add terms"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
