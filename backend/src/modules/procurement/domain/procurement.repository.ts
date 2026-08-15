import type { PurchaseOrder } from "./purchase-order.entity.js";

export interface CreatePurchaseOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderInput {
  organizationId: string;
  supplierId: string;
  notes?: string;
  items: CreatePurchaseOrderItemInput[];
}

export interface ProcurementRepository {
  createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrder>;
  listPurchaseOrders(organizationId: string): Promise<PurchaseOrder[]>;
  findPurchaseOrderById(id: string, organizationId: string): Promise<PurchaseOrder | null>;
  approvePurchaseOrder(
    id: string,
    organizationId: string,
    approvedByUserId: string
  ): Promise<PurchaseOrder>;
}
