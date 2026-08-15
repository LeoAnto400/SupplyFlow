import { NotFoundError } from "../../../shared/domain/errors.js";
import type { InventoryRepository } from "../../inventory/domain/inventory.repository.js";
import type { SuppliersRepository } from "../domain/suppliers.repository.js";
import type { SupplierProduct } from "../domain/supplier-product.entity.js";

export interface CreateSupplierProductCommand {
  organizationId: string;
  supplierId: string;
  productId: string;
  price: number;
  leadTimeDays: number;
  minOrderQty: number;
  reliabilityScore: number;
}

// Depends on Inventory's repository port (not its infrastructure) to confirm
// the product exists and belongs to the same tenant before linking it — a
// module composing another module's domain port, per docs/architecture.md §2.
export class CreateSupplierProductUseCase {
  constructor(
    private readonly suppliersRepository: SuppliersRepository,
    private readonly inventoryRepository: InventoryRepository
  ) {}

  async execute(command: CreateSupplierProductCommand): Promise<SupplierProduct> {
    const supplier = await this.suppliersRepository.findSupplierById(
      command.supplierId,
      command.organizationId
    );
    if (!supplier) {
      throw new NotFoundError("Supplier", command.supplierId);
    }

    const product = await this.inventoryRepository.findProductById(
      command.productId,
      command.organizationId
    );
    if (!product) {
      throw new NotFoundError("Product", command.productId);
    }

    return this.suppliersRepository.createSupplierProduct(command);
  }
}
