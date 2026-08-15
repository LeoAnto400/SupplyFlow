import { NotFoundError } from "../../../shared/domain/errors.js";
import type { SuppliersRepository } from "../domain/suppliers.repository.js";

export class DeleteSupplierUseCase {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  async execute(id: string, organizationId: string): Promise<void> {
    const existing = await this.suppliersRepository.findSupplierById(id, organizationId);
    if (!existing) {
      throw new NotFoundError("Supplier", id);
    }

    await this.suppliersRepository.deleteSupplier(id, organizationId);
  }
}
