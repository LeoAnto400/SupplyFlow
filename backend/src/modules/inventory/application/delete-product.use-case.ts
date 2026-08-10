import { NotFoundError } from "../../../shared/domain/errors.js";
import type { InventoryRepository } from "../domain/inventory.repository.js";

export class DeleteProductUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(id: string, organizationId: string): Promise<void> {
    const existing = await this.inventoryRepository.findProductById(id, organizationId);
    if (!existing) {
      throw new NotFoundError("Product", id);
    }

    await this.inventoryRepository.deleteProduct(id, organizationId);
  }
}
