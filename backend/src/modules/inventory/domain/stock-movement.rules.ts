import { ConflictError } from "../../../shared/domain/errors.js";
import type { Product } from "./product.entity.js";

export interface AppliedMovement {
  newQuantity: number;
  isBelowThreshold: boolean;
}

// Pure, framework-free business rule — see docs/architecture.md §4/§9b.
// Quantity can never go negative, and "low stock" is defined here so it's
// unit-testable without a DB or an LLM in the loop.
export function applyStockMovement(product: Product, delta: number): AppliedMovement {
  const newQuantity = product.quantity + delta;

  if (newQuantity < 0) {
    throw new ConflictError(
      `Stock movement would bring "${product.name}" below zero (current: ${product.quantity}, delta: ${delta})`
    );
  }

  return {
    newQuantity,
    isBelowThreshold: newQuantity < product.safetyThreshold,
  };
}