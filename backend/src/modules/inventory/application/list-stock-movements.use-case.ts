import { NotFoundError } from "../../../shared/domain/errors.js";
import type { InventoryRepository } from "../domain/inventory.repository.js";
import type { StockMovement } from "../domain/stock-movement.entity.js";

export class ListStockMovementsUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(productId: string, organizationId: string): Promise<StockMovement[]> {
    const product = await this.inventoryRepository.findProductById(productId, organizationId);
    if (!product) {
      throw new NotFoundError("Product", productId);
    }

    return this.inventoryRepository.listStockMovements(productId, organizationId);
  }
}
