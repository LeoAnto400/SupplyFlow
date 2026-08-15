import { NotFoundError } from "../../../shared/domain/errors.js";
import type { SuppliersRepository, UpdateSupplierInput } from "../domain/suppliers.repository.js";
import type { Supplier } from "../domain/supplier.entity.js";

export class UpdateSupplierUseCase {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  async execute(id: string, organizationId: string, input: UpdateSupplierInput): Promise<Supplier> {
    const existing = await this.suppliersRepository.findSupplierById(id, organizationId);
    if (!existing) {
      throw new NotFoundError("Supplier", id);
    }

    return this.suppliersRepository.updateSupplier(id, organizationId, input);
  }
}
