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
import { useUpdateSupplier } from "@/hooks/use-suppliers";
import { ApiRequestError } from "@/lib/api/client";
import type { Supplier } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  contactEmail: z.union([z.string().email("Enter a valid email address"), z.literal("")]),
  contactPhone: z.string(),
});

type FormValues = z.infer<typeof schema>;

function toDefaults(supplier: Supplier): FormValues {
  return {
    name: supplier.name,
    contactEmail: supplier.contactEmail ?? "",
    contactPhone: supplier.contactPhone ?? "",
  };
}

export function EditSupplierDialog({ supplier }: { supplier: Supplier }) {
  const [open, setOpen] = useState(false);
  const updateSupplier = useUpdateSupplier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(supplier),
  });

  async function onSubmit(values: FormValues) {
    try {
      await updateSupplier.mutateAsync({
        id: supplier.id,
        input: {
          name: values.name,
          contactEmail: values.contactEmail || undefined,
          contactPhone: values.contactPhone.trim() || undefined,
        },
      });
      toast.success(`${values.name} updated`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not update supplier.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) reset(toDefaults(supplier));
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="icon-sm" />}>
        <Pencil />
        <span className="sr-only">Edit {supplier.name}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit supplier</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="edit-name">Name</FieldLabel>
              <Input id="edit-name" aria-invalid={!!errors.name} {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.contactEmail}>
              <FieldLabel htmlFor="edit-contactEmail">Contact email (optional)</FieldLabel>
              <Input
                id="edit-contactEmail"
                type="email"
                aria-invalid={!!errors.contactEmail}
                {...register("contactEmail")}
              />
              <FieldError errors={[errors.contactEmail]} />
            </Field>
            <Field data-invalid={!!errors.contactPhone}>
              <FieldLabel htmlFor="edit-contactPhone">Contact phone (optional)</FieldLabel>
              <Input
                id="edit-contactPhone"
                aria-invalid={!!errors.contactPhone}
                {...register("contactPhone")}
              />
              <FieldError errors={[errors.contactPhone]} />
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
