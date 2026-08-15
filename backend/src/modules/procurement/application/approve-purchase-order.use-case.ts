import { ConflictError, NotFoundError } from "../../../shared/domain/errors.js";
import type { ProcurementRepository } from "../domain/procurement.repository.js";
import type { PurchaseOrder } from "../domain/purchase-order.entity.js";

// Human-in-the-loop approval, per README.md's core workflow: a draft PO only
// becomes an official, stored order once a manager approves it here.
export class ApprovePurchaseOrderUseCase {
  constructor(private readonly procurementRepository: ProcurementRepository) {}

  async execute(id: string, organizationId: string, approvedByUserId: string): Promise<PurchaseOrder> {
    const existing = await this.procurementRepository.findPurchaseOrderById(id, organizationId);
    if (!existing) {
      throw new NotFoundError("PurchaseOrder", id);
    }

    if (existing.status === "approved") {
      throw new ConflictError("Purchase order is already approved");
    }

    return this.procurementRepository.approvePurchaseOrder(id, organizationId, approvedByUserId);
  }
}
