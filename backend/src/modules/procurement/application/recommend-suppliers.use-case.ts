import { NotFoundError } from "../../../shared/domain/errors.js";
import type { InventoryRepository } from "../../inventory/domain/inventory.repository.js";
import type { SuppliersRepository } from "../../suppliers/domain/suppliers.repository.js";
import { rankSupplierCandidates, type RankedSupplierCandidate } from "../domain/supplier-ranking.rules.js";

// Implements the "Rules" step of docs/architecture.md §9b — deterministic
// ranking only, no LLM. Composes Inventory's and Suppliers' domain ports,
// the same cross-module pattern used by Suppliers' CreateSupplierProductUseCase.
export class RecommendSuppliersUseCase {
  constructor(
    private readonly suppliersRepository: SuppliersRepository,
    private readonly inventoryRepository: InventoryRepository
  ) {}

  async execute(productId: string, organizationId: string): Promise<RankedSupplierCandidate[]> {
    const product = await this.inventoryRepository.findProductById(productId, organizationId);
    if (!product) {
      throw new NotFoundError("Product", productId);
    }

    const supplierProducts = await this.suppliersRepository.listSupplierProductsByProduct(
      productId,
      organizationId
    );

    const candidates = supplierProducts.map((supplierProduct) => ({
      supplierId: supplierProduct.supplierId,
      supplierProductId: supplierProduct.id,
      price: supplierProduct.price,
      leadTimeDays: supplierProduct.leadTimeDays,
      minOrderQty: supplierProduct.minOrderQty,
      reliabilityScore: supplierProduct.reliabilityScore,
    }));

    return rankSupplierCandidates(candidates);
  }
}
