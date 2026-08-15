// Structured contract terms for one supplier x product pair — what the
// (future) deterministic ranking rule reads, see docs/architecture.md §9b.
export interface SupplierProduct {
  id: string;
  organizationId: string;
  supplierId: string;
  productId: string;
  price: number;
  leadTimeDays: number;
  minOrderQty: number;
  // 0-100 — higher is better.
  reliabilityScore: number;
  createdAt: Date;
  updatedAt: Date;
}
