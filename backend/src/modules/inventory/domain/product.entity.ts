export interface Product {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  quantity: number;
  safetyThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}