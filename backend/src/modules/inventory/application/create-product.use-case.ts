import type { InventoryRepository } from "../domain/inventory.repository.js";
import type { Product } from "../domain/product.entity.js";

export interface CreateProductCommand {
  organizationId: string;
  name: string;
  sku: string;
  quantity: number;
  safetyThreshold: number;
}

export class CreateProductUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  execute(command: CreateProductCommand): Promise<Product> {
    return this.inventoryRepository.createProduct(command);
  }
}
