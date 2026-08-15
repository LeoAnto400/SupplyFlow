import { Prisma, type PrismaClient } from "@prisma/client";
import { ConflictError, NotFoundError } from "../../../shared/domain/errors.js";
import type {
  CreateSupplierInput,
  CreateSupplierProductInput,
  SuppliersRepository,
  UpdateSupplierInput,
  UpdateSupplierProductInput,
} from "../domain/suppliers.repository.js";
import type { Supplier } from "../domain/supplier.entity.js";
import type { SupplierProduct } from "../domain/supplier-product.entity.js";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";
const FOREIGN_KEY_CONSTRAINT_VIOLATION = "P2003";

export class PrismaSuppliersRepository implements SuppliersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createSupplier(input: CreateSupplierInput): Promise<Supplier> {
    return this.toSupplier(await this.prisma.supplier.create({ data: input }));
  }

  async listSuppliers(organizationId: string): Promise<Supplier[]> {
    const rows = await this.prisma.supplier.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toSupplier(row));
  }

  async findSupplierById(id: string, organizationId: string): Promise<Supplier | null> {
    const row = await this.prisma.supplier.findFirst({ where: { id, organizationId } });
    return row ? this.toSupplier(row) : null;
  }

  async updateSupplier(id: string, organizationId: string, input: UpdateSupplierInput): Promise<Supplier> {
    const result = await this.prisma.supplier.updateMany({
      where: { id, organizationId },
      data: input,
    });

    if (result.count === 0) {
      throw new NotFoundError("Supplier", id);
    }

    return this.toSupplier(await this.prisma.supplier.findFirstOrThrow({ where: { id, organizationId } }));
  }

  async deleteSupplier(id: string, organizationId: string): Promise<void> {
    try {
      await this.prisma.supplier.deleteMany({ where: { id, organizationId } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === FOREIGN_KEY_CONSTRAINT_VIOLATION
      ) {
        throw new ConflictError(
          "Cannot delete a supplier that still has product terms linked to it"
        );
      }
      throw error;
    }
  }

  async createSupplierProduct(input: CreateSupplierProductInput): Promise<SupplierProduct> {
    try {
      return await this.prisma.supplierProduct.create({ data: input });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_VIOLATION
      ) {
        throw new ConflictError("This supplier already has terms defined for that product");
      }
      throw error;
    }
  }

  listSupplierProducts(supplierId: string, organizationId: string): Promise<SupplierProduct[]> {
    return this.prisma.supplierProduct.findMany({
      where: { supplierId, organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  findSupplierProductById(id: string, organizationId: string): Promise<SupplierProduct | null> {
    return this.prisma.supplierProduct.findFirst({ where: { id, organizationId } });
  }

  async updateSupplierProduct(
    id: string,
    organizationId: string,
    input: UpdateSupplierProductInput
  ): Promise<SupplierProduct> {
    const result = await this.prisma.supplierProduct.updateMany({
      where: { id, organizationId },
      data: input,
    });

    if (result.count === 0) {
      throw new NotFoundError("SupplierProduct", id);
    }

    return this.prisma.supplierProduct.findFirstOrThrow({ where: { id, organizationId } });
  }

  async deleteSupplierProduct(id: string, organizationId: string): Promise<void> {
    await this.prisma.supplierProduct.deleteMany({ where: { id, organizationId } });
  }

  private toSupplier(row: {
    id: string;
    organizationId: string;
    name: string;
    contactEmail: string | null;
    contactPhone: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Supplier {
    return {
      ...row,
      contactEmail: row.contactEmail ?? undefined,
      contactPhone: row.contactPhone ?? undefined,
    };
  }
}
