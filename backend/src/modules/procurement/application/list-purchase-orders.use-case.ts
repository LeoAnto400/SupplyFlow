import type { ProcurementRepository } from "../domain/procurement.repository.js";
import type { PurchaseOrder } from "../domain/purchase-order.entity.js";

export class ListPurchaseOrdersUseCase {
  constructor(private readonly procurementRepository: ProcurementRepository) {}

  execute(organizationId: string): Promise<PurchaseOrder[]> {
    return this.procurementRepository.listPurchaseOrders(organizationId);
  }
}
