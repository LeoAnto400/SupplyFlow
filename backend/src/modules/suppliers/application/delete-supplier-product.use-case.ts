import { NotFoundError } from "../../../shared/domain/errors.js";
import type { SuppliersRepository } from "../domain/suppliers.repository.js";

export class DeleteSupplierProductUseCase {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  async execute(id: string, organizationId: string): Promise<void> {
    const existing = await this.suppliersRepository.findSupplierProductById(id, organizationId);
    if (!existing) {
      throw new NotFoundError("SupplierProduct", id);
    }

    await this.suppliersRepository.deleteSupplierProduct(id, organizationId);
  }
}
