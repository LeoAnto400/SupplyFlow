import { NotFoundError } from "../../../shared/domain/errors.js";
import type { ProcurementRepository } from "../domain/procurement.repository.js";
import type { PurchaseOrder } from "../domain/purchase-order.entity.js";

export class GetPurchaseOrderUseCase {
  constructor(private readonly procurementRepository: ProcurementRepository) {}

  async execute(id: string, organizationId: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.procurementRepository.findPurchaseOrderById(id, organizationId);

    if (!purchaseOrder) {
      throw new NotFoundError("PurchaseOrder", id);
    }

    return purchaseOrder;
  }
}
