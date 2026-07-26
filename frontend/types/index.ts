// Shared DTO/response types mirroring backend module contracts (see docs/architecture.md §8).
// Kept in sync with backend/src/modules/*/presentation DTOs by hand for MVP.

export type Role = "admin" | "manager";

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: Role;
}

export interface Product {
  id: string;
  organizationId: string;
  sku: string;
  name: string;
  quantity: number;
  safetyThreshold: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  reason: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  productId: string;
  price: number;
  leadTimeDays: number;
  minOrderQuantity: number;
  reliabilityScore: number;
}

export interface DocumentAsset {
  id: string;
  supplierId: string;
  fileName: string;
  status: "processing" | "ready" | "failed";
}

export type PurchaseOrderStatus = "draft" | "approved";

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  organizationId: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface Notification {
  id: string;
  organizationId: string;
  type: string;
  message: string;
  createdAt: string;
  readAt: string | null;
}

export interface ApiError {
  message: string;
  code?: string;
}
