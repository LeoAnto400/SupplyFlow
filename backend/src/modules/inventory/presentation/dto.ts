import { z } from "zod";

export const createProductBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  quantity: z.number().int().min(0).default(0),
  safetyThreshold: z.number().int().min(0).default(0),
});

export const updateProductBodySchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  safetyThreshold: z.number().int().min(0).optional(),
});

export const recordStockMovementBodySchema = z.object({
  // Signed change: positive to add stock, negative to remove it.
  delta: z.number().int().refine((value) => value !== 0, "Delta must not be zero"),
  reason: z.string().min(1).optional(),
});

export type CreateProductBody = z.infer<typeof createProductBodySchema>;
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>;
export type RecordStockMovementBody = z.infer<typeof recordStockMovementBodySchema>;
