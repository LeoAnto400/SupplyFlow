import type { SuppliersRepository } from "../domain/suppliers.repository.js";
import type { Supplier } from "../domain/supplier.entity.js";

export interface CreateSupplierCommand {
  organizationId: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}

export class CreateSupplierUseCase {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  execute(command: CreateSupplierCommand): Promise<Supplier> {
    return this.suppliersRepository.createSupplier(command);
  }
}
