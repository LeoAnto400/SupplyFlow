"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRecordStockMovement } from "@/hooks/use-products";
import { ApiRequestError } from "@/lib/api/client";
import type { Product } from "@/types";

const schema = z.object({
  delta: z
    .number({ error: "Enter an amount" })
    .int("Must be a whole number")
    .refine((value) => value !== 0, "Enter a non-zero amount"),
  reason: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function StockMovementDialog({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const recordStockMovement = useRecordStockMovement();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    const reason = values.reason?.trim();

    try {
      const { product: updated } = await recordStockMovement.mutateAsync({
        productId: product.id,
        input: { delta: values.delta, reason: reason || undefined },
      });

      toast.success(
        updated.quantity < updated.safetyThreshold
          ? `${updated.name} is now at ${updated.quantity} — below its low-stock threshold`
          : `${updated.name} is now at ${updated.quantity}`
      );
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not record stock movement.");
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
      <DialogTrigger render={<Button variant="outline" size="icon-sm" />}>
        <ArrowUpDown />
        <span className="sr-only">Adjust stock for {product.name}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock — {product.name}</DialogTitle>
          <DialogDescription>Currently {product.quantity} in stock.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.delta}>
              <FieldLabel htmlFor="delta">Change in quantity</FieldLabel>
              <Input
                id="delta"
                type="number"
                placeholder="e.g. -5 or 20"
                aria-invalid={!!errors.delta}
                {...register("delta", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.delta]} />
            </Field>
            <Field data-invalid={!!errors.reason}>
              <FieldLabel htmlFor="reason">Reason (optional)</FieldLabel>
              <Input id="reason" aria-invalid={!!errors.reason} {...register("reason")} />
              <FieldError errors={[errors.reason]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording…" : "Record movement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
