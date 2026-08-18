"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { useCreateProduct } from "@/hooks/use-products";
import { ApiRequestError } from "@/lib/api/client";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  quantity: z.number().int().min(0, "Must be 0 or greater"),
  safetyThreshold: z.number().int().min(0, "Must be 0 or greater"),
});

type FormValues = z.infer<typeof schema>;

export function CreateProductDialog() {
  const [open, setOpen] = useState(false);
  const createProduct = useCreateProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", sku: "", quantity: 0, safetyThreshold: 0 },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createProduct.mutateAsync(values);
      toast.success(`${values.name} added`);
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not create product.");
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
      <DialogTrigger render={<Button />}>
        <Plus />
        Add product
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add product</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.sku}>
              <FieldLabel htmlFor="sku">SKU</FieldLabel>
              <Input id="sku" aria-invalid={!!errors.sku} {...register("sku")} />
              <FieldError errors={[errors.sku]} />
            </Field>
            <Field data-invalid={!!errors.quantity}>
              <FieldLabel htmlFor="quantity">Starting quantity</FieldLabel>
              <Input
                id="quantity"
                type="number"
                min={0}
                aria-invalid={!!errors.quantity}
                {...register("quantity", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.quantity]} />
            </Field>
            <Field data-invalid={!!errors.safetyThreshold}>
              <FieldLabel htmlFor="safetyThreshold">Low-stock threshold</FieldLabel>
              <Input
                id="safetyThreshold"
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
              {isSubmitting ? "Adding…" : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
