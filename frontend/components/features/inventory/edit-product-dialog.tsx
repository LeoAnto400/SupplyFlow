"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
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
import { useUpdateProduct } from "@/hooks/use-products";
import { ApiRequestError } from "@/lib/api/client";
import type { Product } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  safetyThreshold: z.number().int().min(0, "Must be 0 or greater"),
});

type FormValues = z.infer<typeof schema>;

export function EditProductDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product.name,
      sku: product.sku,
      safetyThreshold: product.safetyThreshold,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await updateProduct.mutateAsync({ id: product.id, input: values });
      toast.success(`${values.name} updated`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not update product.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          reset({ name: product.name, sku: product.sku, safetyThreshold: product.safetyThreshold });
        }
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="icon-sm" />}>
        <Pencil />
        <span className="sr-only">Edit {product.name}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit product</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="edit-name">Name</FieldLabel>
              <Input id="edit-name" aria-invalid={!!errors.name} {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.sku}>
              <FieldLabel htmlFor="edit-sku">SKU</FieldLabel>
              <Input id="edit-sku" aria-invalid={!!errors.sku} {...register("sku")} />
              <FieldError errors={[errors.sku]} />
            </Field>
            <Field data-invalid={!!errors.safetyThreshold}>
              <FieldLabel htmlFor="edit-safetyThreshold">Low-stock threshold</FieldLabel>
              <Input
                id="edit-safetyThreshold"
                type="number"
                min={0}
                aria-invalid={!!errors.safetyThreshold}
                {...register("safetyThreshold", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.safetyThreshold]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
