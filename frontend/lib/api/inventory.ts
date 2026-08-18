import { apiFetch } from "./client";
import type { Product, StockMovement } from "@/types";

export interface CreateProductInput {
  name: string;
  sku: string;
  quantity: number;
  safetyThreshold: number;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  safetyThreshold?: number;
}

export interface RecordStockMovementInput {
  delta: number;
  reason?: string;
}

export interface RecordStockMovementResult {
  product: Product;
  movement: StockMovement;
}

export function listProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/api/v1/products");
}

export function createProduct(input: CreateProductInput): Promise<Product> {
  return apiFetch<Product>("/api/v1/products", { method: "POST", body: JSON.stringify(input) });
}

export function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  return apiFetch<Product>(`/api/v1/products/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteProduct(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/products/${id}`, { method: "DELETE" });
}

export function recordStockMovement(
  productId: string,
  input: RecordStockMovementInput
): Promise<RecordStockMovementResult> {
  return apiFetch<RecordStockMovementResult>(`/api/v1/products/${productId}/stock-movements`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listStockMovements(productId: string): Promise<StockMovement[]> {
  return apiFetch<StockMovement[]>(`/api/v1/products/${productId}/stock-movements`);
}
