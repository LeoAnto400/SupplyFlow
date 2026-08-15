import type { Supplier } from "./supplier.entity.js";
import type { SupplierProduct } from "./supplier-product.entity.js";

export interface CreateSupplierInput {
  organizationId: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateSupplierInput {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface CreateSupplierProductInput {
  organizationId: string;
  supplierId: string;
  productId: string;
  price: number;
  leadTimeDays: number;
  minOrderQty: number;
  reliabilityScore: number;
}

export interface UpdateSupplierProductInput {
  price?: number;
  leadTimeDays?: number;
  minOrderQty?: number;
  reliabilityScore?: number;
}

export interface SuppliersRepository {
  createSupplier(input: CreateSupplierInput): Promise<Supplier>;
  listSuppliers(organizationId: string): Promise<Supplier[]>;
  findSupplierById(id: string, organizationId: string): Promise<Supplier | null>;
  updateSupplier(id: string, organizationId: string, input: UpdateSupplierInput): Promise<Supplier>;
  deleteSupplier(id: string, organizationId: string): Promise<void>;

  createSupplierProduct(input: CreateSupplierProductInput): Promise<SupplierProduct>;
  listSupplierProducts(supplierId: string, organizationId: string): Promise<SupplierProduct[]>;
  findSupplierProductById(id: string, organizationId: string): Promise<SupplierProduct | null>;
  updateSupplierProduct(
    id: string,
    organizationId: string,
    input: UpdateSupplierProductInput
  ): Promise<SupplierProduct>;
  deleteSupplierProduct(id: string, organizationId: string): Promise<void>;
}
