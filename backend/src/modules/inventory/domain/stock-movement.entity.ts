export interface StockMovement {
  id: string;
  organizationId: string;
  productId: string;
  // Signed change applied to Product.quantity — positive is stock in,
  // negative is stock out.
  delta: number;
  reason?: string;
  createdAt: Date;
}