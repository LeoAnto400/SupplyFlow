import type { Product } from "./product.entity.js";
import type { StockMovement } from "./stock-movement.entity.js";

export interface CreateProductInput {
  organizationId: string;
  name: string;
  sku: string;
  quantity: number;
  safetyThreshold: number;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  safetyThreshold?: number;
}

export interface InventoryRepository {
  createProduct(input: CreateProductInput): Promise<Product>;
  listProducts(organizationId: string): Promise<Product[]>;
  findProductById(id: string, organizationId: string): Promise<Product | null>;
  updateProduct(id: string, organizationId: string, input: UpdateProductInput): Promise<Product>;
  deleteProduct(id: string, organizationId: string): Promise<void>;

  // Persists the product's new quantity and the movement audit row in one
  // transaction — see docs/architecture.md §4 ("Every write is wrapped in a
  // single Prisma transaction at the repository/use-case boundary").
  applyStockMovement(
    product: Product,
    newQuantity: number,
    delta: number,
    reason: string | undefined
  ): Promise<{ product: Product; movement: StockMovement }>;

  listStockMovements(productId: string, organizationId: string): Promise<StockMovement[]>;
}