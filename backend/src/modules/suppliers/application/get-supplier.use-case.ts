import { NotFoundError } from "../../../shared/domain/errors.js";
import type { SuppliersRepository } from "../domain/suppliers.repository.js";
import type { Supplier } from "../domain/supplier.entity.js";

export class GetSupplierUseCase {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  async execute(id: string, organizationId: string): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findSupplierById(id, organizationId);

    if (!supplier) {
      throw new NotFoundError("Supplier", id);
    }

    return supplier;
  }
}
