import { NotFoundError } from "../../../shared/domain/errors.js";
import type { InventoryRepository } from "../../inventory/domain/inventory.repository.js";
import type { SuppliersRepository } from "../../suppliers/domain/suppliers.repository.js";
import type {
  CreatePurchaseOrderItemInput,
  ProcurementRepository,
} from "../domain/procurement.repository.js";
import type { PurchaseOrder } from "../domain/purchase-order.entity.js";

export interface CreatePurchaseOrderCommand {
  organizationId: string;
  supplierId: string;
  notes?: string;
  items: CreatePurchaseOrderItemInput[];
}

export class CreatePurchaseOrderUseCase {
  constructor(
    private readonly procurementRepository: ProcurementRepository,
    private readonly suppliersRepository: SuppliersRepository,
    private readonly inventoryRepository: InventoryRepository
  ) {}

  async execute(command: CreatePurchaseOrderCommand): Promise<PurchaseOrder> {
    const supplier = await this.suppliersRepository.findSupplierById(
      command.supplierId,
      command.organizationId
    );
    if (!supplier) {
      throw new NotFoundError("Supplier", command.supplierId);
    }

    for (const item of command.items) {
      const product = await this.inventoryRepository.findProductById(
        item.productId,
        command.organizationId
      );
      if (!product) {
        throw new NotFoundError("Product", item.productId);
      }
    }

    return this.procurementRepository.createPurchaseOrder(command);
  }
}
