import { Prisma, type PrismaClient } from "@prisma/client";
import { ConflictError, NotFoundError } from "../../../shared/domain/errors.js";
import type {
  CreateProductInput,
  InventoryRepository,
  UpdateProductInput,
} from "../domain/inventory.repository.js";
import type { Product } from "../domain/product.entity.js";
import type { StockMovement } from "../domain/stock-movement.entity.js";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

export class PrismaInventoryRepository implements InventoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createProduct(input: CreateProductInput): Promise<Product> {
    try {
      return await this.prisma.product.create({ data: input });
    } catch (error) {
      throw this.mapSkuConflict(error, input.sku);
    }
  }

  listProducts(organizationId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  findProductById(id: string, organizationId: string): Promise<Product | null> {
    return this.prisma.product.findFirst({ where: { id, organizationId } });
  }

  async updateProduct(id: string, organizationId: string, input: UpdateProductInput): Promise<Product> {
    try {
      // updateMany (rather than update) so organizationId is enforced in the
      // same query, not just trusted from the caller — see
      // docs/architecture.md §7.
      const result = await this.prisma.product.updateMany({
        where: { id, organizationId },
        data: input,
      });

      if (result.count === 0) {
        throw new NotFoundError("Product", id);
      }

      // updateMany doesn't return the row — re-read it.
      return await this.prisma.product.findFirstOrThrow({ where: { id, organizationId } });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw this.mapSkuConflict(error, input.sku);
    }
  }

  async deleteProduct(id: string, organizationId: string): Promise<void> {
    await this.prisma.product.deleteMany({ where: { id, organizationId } });
  }

  async applyStockMovement(
    product: Product,
    newQuantity: number,
    delta: number,
    reason: string | undefined
  ): Promise<{ product: Product; movement: StockMovement }> {
    return this.prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: { quantity: newQuantity },
      });

      const movement = await tx.stockMovement.create({
        data: {
          organizationId: product.organizationId,
          productId: product.id,
          delta,
          reason,
        },
      });

      return { product: updatedProduct, movement: this.toStockMovement(movement) };
    });
  }

  listStockMovements(productId: string, organizationId: string): Promise<StockMovement[]> {
    return this.prisma.stockMovement
      .findMany({
        where: { productId, organizationId },
        orderBy: { createdAt: "desc" },
      })
      .then((rows) => rows.map((row) => this.toStockMovement(row)));
  }

  private toStockMovement(row: {
    id: string;
    organizationId: string;
    productId: string;
    delta: number;
    reason: string | null;
    createdAt: Date;
  }): StockMovement {
    return { ...row, reason: row.reason ?? undefined };
  }

  private mapSkuConflict(error: unknown, sku: string | undefined): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_VIOLATION) {
      return new ConflictError(`A product with SKU "${sku}" already exists`);
    }
    return error;
  }
}
