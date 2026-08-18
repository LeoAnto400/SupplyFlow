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
import { useCreateSupplier } from "@/hooks/use-suppliers";
import { ApiRequestError } from "@/lib/api/client";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  contactEmail: z.union([z.string().email("Enter a valid email address"), z.literal("")]),
  contactPhone: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function CreateSupplierDialog() {
  const [open, setOpen] = useState(false);
  const createSupplier = useCreateSupplier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", contactEmail: "", contactPhone: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createSupplier.mutateAsync({
        name: values.name,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone.trim() || undefined,
      });
      toast.success(`${values.name} added`);
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not create supplier.");
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
        Add supplier
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add supplier</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.contactEmail}>
              <FieldLabel htmlFor="contactEmail">Contact email (optional)</FieldLabel>
              <Input
                id="contactEmail"
                type="email"
                aria-invalid={!!errors.contactEmail}
                {...register("contactEmail")}
              />
              <FieldError errors={[errors.contactEmail]} />
            </Field>
            <Field data-invalid={!!errors.contactPhone}>
              <FieldLabel htmlFor="contactPhone">Contact phone (optional)</FieldLabel>
              <Input id="contactPhone" aria-invalid={!!errors.contactPhone} {...register("contactPhone")} />
              <FieldError errors={[errors.contactPhone]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
