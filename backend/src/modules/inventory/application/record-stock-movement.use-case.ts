import { NotFoundError } from "../../../shared/domain/errors.js";
import type { EventBus } from "../../../shared/event-bus/index.js";
import type { InventoryRepository } from "../domain/inventory.repository.js";
import type { Product } from "../domain/product.entity.js";
import type { StockMovement } from "../domain/stock-movement.entity.js";
import { applyStockMovement } from "../domain/stock-movement.rules.js";
import { LOW_STOCK_DETECTED_EVENT, type LowStockDetectedEvent } from "./events.js";

export interface RecordStockMovementCommand {
  productId: string;
  organizationId: string;
  delta: number;
  reason?: string;
}

export interface RecordStockMovementResult {
  product: Product;
  movement: StockMovement;
}

// Implements docs/architecture.md §4 + §10: apply the deterministic
// threshold rule, persist, then publish LowStockDetected if it crossed
// below the safety threshold.
export class RecordStockMovementUseCase {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: RecordStockMovementCommand): Promise<RecordStockMovementResult> {
    const product = await this.inventoryRepository.findProductById(
      command.productId,
      command.organizationId
    );
    if (!product) {
      throw new NotFoundError("Product", command.productId);
    }

    const { newQuantity, isBelowThreshold } = applyStockMovement(product, command.delta);

    const { product: updatedProduct, movement } = await this.inventoryRepository.applyStockMovement(
      product,
      newQuantity,
      command.delta,
      command.reason
    );

    if (isBelowThreshold) {
      this.eventBus.publish<LowStockDetectedEvent>(LOW_STOCK_DETECTED_EVENT, {
        organizationId: updatedProduct.organizationId,
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        quantity: updatedProduct.quantity,
        safetyThreshold: updatedProduct.safetyThreshold,
      });
    }

    return { product: updatedProduct, movement };
  }
}
