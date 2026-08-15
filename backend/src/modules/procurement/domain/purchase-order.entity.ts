export type PurchaseOrderStatus = "draft" | "approved";

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
}

export interface PurchaseOrder {
  id: string;
  organizationId: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  notes?: string;
  approvedByUserId?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  items: PurchaseOrderItem[];
}
