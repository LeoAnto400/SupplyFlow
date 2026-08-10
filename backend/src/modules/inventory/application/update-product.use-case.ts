import { NotFoundError } from "../../../shared/domain/errors.js";
import type { InventoryRepository, UpdateProductInput } from "../domain/inventory.repository.js";
import type { Product } from "../domain/product.entity.js";

export class UpdateProductUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(id: string, organizationId: string, input: UpdateProductInput): Promise<Product> {
    const existing = await this.inventoryRepository.findProductById(id, organizationId);
    if (!existing) {
      throw new NotFoundError("Product", id);
    }

    return this.inventoryRepository.updateProduct(id, organizationId, input);
  }
}
