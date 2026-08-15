import { NotFoundError } from "../../../shared/domain/errors.js";
import type { SuppliersRepository } from "../domain/suppliers.repository.js";
import type { SupplierProduct } from "../domain/supplier-product.entity.js";

export class ListSupplierProductsUseCase {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  async execute(supplierId: string, organizationId: string): Promise<SupplierProduct[]> {
    const supplier = await this.suppliersRepository.findSupplierById(supplierId, organizationId);
    if (!supplier) {
      throw new NotFoundError("Supplier", supplierId);
    }

    return this.suppliersRepository.listSupplierProducts(supplierId, organizationId);
  }
}
