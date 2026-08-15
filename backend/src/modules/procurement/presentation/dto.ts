import { z } from "zod";

export const createPurchaseOrderBodySchema = z.object({
  supplierId: z.string().uuid(),
  notes: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative(),
      })
    )
    .min(1, "At least one item is required"),
});

export type CreatePurchaseOrderBody = z.infer<typeof createPurchaseOrderBodySchema>;
