import { apiFetch } from "./client";
import type { Supplier, SupplierProduct } from "@/types";

export interface CreateSupplierInput {
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

export function listSuppliers(): Promise<Supplier[]> {
  return apiFetch<Supplier[]>("/api/v1/suppliers");
}

export function createSupplier(input: CreateSupplierInput): Promise<Supplier> {
  return apiFetch<Supplier>("/api/v1/suppliers", { method: "POST", body: JSON.stringify(input) });
}

export function updateSupplier(id: string, input: UpdateSupplierInput): Promise<Supplier> {
  return apiFetch<Supplier>(`/api/v1/suppliers/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteSupplier(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/suppliers/${id}`, { method: "DELETE" });
}

export function listSupplierProducts(supplierId: string): Promise<SupplierProduct[]> {
  return apiFetch<SupplierProduct[]>(`/api/v1/suppliers/${supplierId}/products`);
}

export function createSupplierProduct(
  supplierId: string,
  input: CreateSupplierProductInput
): Promise<SupplierProduct> {
  return apiFetch<SupplierProduct>(`/api/v1/suppliers/${supplierId}/products`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateSupplierProduct(
  supplierId: string,
  termId: string,
  input: UpdateSupplierProductInput
): Promise<SupplierProduct> {
  return apiFetch<SupplierProduct>(`/api/v1/suppliers/${supplierId}/products/${termId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteSupplierProduct(supplierId: string, termId: string): Promise<void> {
  return apiFetch<void>(`/api/v1/suppliers/${supplierId}/products/${termId}`, { method: "DELETE" });
}
