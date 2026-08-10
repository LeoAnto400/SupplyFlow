import type { InventoryRepository } from "../domain/inventory.repository.js";
import type { Product } from "../domain/product.entity.js";

export class ListProductsUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  execute(organizationId: string): Promise<Product[]> {
    return this.inventoryRepository.listProducts(organizationId);
  }
}
