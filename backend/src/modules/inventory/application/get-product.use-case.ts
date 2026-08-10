import { NotFoundError } from "../../../shared/domain/errors.js";
import type { InventoryRepository } from "../domain/inventory.repository.js";
import type { Product } from "../domain/product.entity.js";

export class GetProductUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(id: string, organizationId: string): Promise<Product> {
    const product = await this.inventoryRepository.findProductById(id, organizationId);

    if (!product) {
      throw new NotFoundError("Product", id);
    }

    return product;
  }
}
