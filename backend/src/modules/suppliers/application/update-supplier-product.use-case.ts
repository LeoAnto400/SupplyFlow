import { NotFoundError } from "../../../shared/domain/errors.js";
import type {
  SuppliersRepository,
  UpdateSupplierProductInput,
} from "../domain/suppliers.repository.js";
import type { SupplierProduct } from "../domain/supplier-product.entity.js";

export class UpdateSupplierProductUseCase {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  async execute(
    id: string,
    organizationId: string,
    input: UpdateSupplierProductInput
  ): Promise<SupplierProduct> {
    const existing = await this.suppliersRepository.findSupplierProductById(id, organizationId);
    if (!existing) {
      throw new NotFoundError("SupplierProduct", id);
    }

    return this.suppliersRepository.updateSupplierProduct(id, organizationId, input);
  }
}
