import type { SuppliersRepository } from "../domain/suppliers.repository.js";
import type { Supplier } from "../domain/supplier.entity.js";

export class ListSuppliersUseCase {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  execute(organizationId: string): Promise<Supplier[]> {
    return this.suppliersRepository.listSuppliers(organizationId);
  }
}
