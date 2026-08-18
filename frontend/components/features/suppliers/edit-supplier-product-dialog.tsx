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
import { useUpdateSupplierProduct } from "@/hooks/use-suppliers";
import { ApiRequestError } from "@/lib/api/client";
import type { SupplierProduct } from "@/types";

const schema = z.object({
  price: z.number().min(0, "Must be 0 or greater"),
  leadTimeDays: z.number().int().min(0, "Must be 0 or greater"),
  minOrderQty: z.number().int().min(1, "Must be at least 1"),
  reliabilityScore: z.number().min(0, "Must be between 0 and 100").max(100, "Must be between 0 and 100"),
});

type FormValues = z.infer<typeof schema>;

function toDefaults(term: SupplierProduct): FormValues {
  return {
    price: term.price,
    leadTimeDays: term.leadTimeDays,
    minOrderQty: term.minOrderQty,
    reliabilityScore: term.reliabilityScore,
  };
}

export function EditSupplierProductDialog({
  supplierId,
  term,
  productLabel,
}: {
  supplierId: string;
  term: SupplierProduct;
  productLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const updateSupplierProduct = useUpdateSupplierProduct(supplierId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(term),
  });

  async function onSubmit(values: FormValues) {
    try {
      await updateSupplierProduct.mutateAsync({ termId: term.id, input: values });
      toast.success("Product terms updated");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not update product terms.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) reset(toDefaults(term));
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="icon-sm" />}>
        <Pencil />
        <span className="sr-only">Edit terms for {productLabel}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit terms — {productLabel}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="edit-price">Price</FieldLabel>
              <Input
                id="edit-price"
                type="number"
                min={0}
                step="0.01"
                aria-invalid={!!errors.price}
                {...register("price", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.price]} />
            </Field>
            <Field data-invalid={!!errors.leadTimeDays}>
              <FieldLabel htmlFor="edit-leadTimeDays">Lead time (days)</FieldLabel>
              <Input
                id="edit-leadTimeDays"
                type="number"
                min={0}
                aria-invalid={!!errors.leadTimeDays}
                {...register("leadTimeDays", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.leadTimeDays]} />
            </Field>
            <Field data-invalid={!!errors.minOrderQty}>
              <FieldLabel htmlFor="edit-minOrderQty">Minimum order quantity</FieldLabel>
              <Input
                id="edit-minOrderQty"
                type="number"
                min={1}
                aria-invalid={!!errors.minOrderQty}
                {...register("minOrderQty", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.minOrderQty]} />
            </Field>
            <Field data-invalid={!!errors.reliabilityScore}>
              <FieldLabel htmlFor="edit-reliabilityScore">Reliability score (0-100)</FieldLabel>
              <Input
                id="edit-reliabilityScore"
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
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
