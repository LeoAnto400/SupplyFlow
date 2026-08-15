import { z } from "zod";

export const createSupplierBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(1).optional(),
});

export const updateSupplierBodySchema = z.object({
  name: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(1).optional(),
});

export const createSupplierProductBodySchema = z.object({
  productId: z.string().uuid(),
  price: z.number().nonnegative(),
  leadTimeDays: z.number().int().nonnegative(),
  minOrderQty: z.number().int().positive(),
  reliabilityScore: z.number().min(0).max(100),
});

export const updateSupplierProductBodySchema = z.object({
  price: z.number().nonnegative().optional(),
  leadTimeDays: z.number().int().nonnegative().optional(),
  minOrderQty: z.number().int().positive().optional(),
  reliabilityScore: z.number().min(0).max(100).optional(),
});

export type CreateSupplierBody = z.infer<typeof createSupplierBodySchema>;
export type UpdateSupplierBody = z.infer<typeof updateSupplierBodySchema>;
export type CreateSupplierProductBody = z.infer<typeof createSupplierProductBodySchema>;
export type UpdateSupplierProductBody = z.infer<typeof updateSupplierProductBodySchema>;
