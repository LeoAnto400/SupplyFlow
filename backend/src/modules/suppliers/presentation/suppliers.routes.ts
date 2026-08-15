import type { FastifyInstance } from "fastify";
import type { Env } from "../../../shared/config/env.js";
import { prisma } from "../../../shared/prisma/client.js";
import { getTenantContext } from "../../../shared/tenant-context/index.js";
import { createAuthGuard } from "../../../plugins/auth-guard.js";
import { PrismaInventoryRepository } from "../../inventory/infrastructure/prisma-inventory.repository.js";
import { PrismaSuppliersRepository } from "../infrastructure/prisma-suppliers.repository.js";
import { CreateSupplierUseCase } from "../application/create-supplier.use-case.js";
import { ListSuppliersUseCase } from "../application/list-suppliers.use-case.js";
import { GetSupplierUseCase } from "../application/get-supplier.use-case.js";
import { UpdateSupplierUseCase } from "../application/update-supplier.use-case.js";
import { DeleteSupplierUseCase } from "../application/delete-supplier.use-case.js";
import { CreateSupplierProductUseCase } from "../application/create-supplier-product.use-case.js";
import { ListSupplierProductsUseCase } from "../application/list-supplier-products.use-case.js";
import { UpdateSupplierProductUseCase } from "../application/update-supplier-product.use-case.js";
import { DeleteSupplierProductUseCase } from "../application/delete-supplier-product.use-case.js";
import type { Supplier } from "../domain/supplier.entity.js";
import type { SupplierProduct } from "../domain/supplier-product.entity.js";
import {
  createSupplierBodySchema,
  updateSupplierBodySchema,
  createSupplierProductBodySchema,
  updateSupplierProductBodySchema,
} from "./dto.js";

function toSupplierDto(supplier: Supplier) {
  return {
    id: supplier.id,
    name: supplier.name,
    contactEmail: supplier.contactEmail ?? null,
    contactPhone: supplier.contactPhone ?? null,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  };
}

function toSupplierProductDto(supplierProduct: SupplierProduct) {
  return {
    id: supplierProduct.id,
    supplierId: supplierProduct.supplierId,
    productId: supplierProduct.productId,
    price: supplierProduct.price,
    leadTimeDays: supplierProduct.leadTimeDays,
    minOrderQty: supplierProduct.minOrderQty,
    reliabilityScore: supplierProduct.reliabilityScore,
    createdAt: supplierProduct.createdAt,
    updatedAt: supplierProduct.updatedAt,
  };
}

export function registerSuppliersModule(app: FastifyInstance, env: Env): void {
  const suppliersRepository = new PrismaSuppliersRepository(prisma);
  const inventoryRepository = new PrismaInventoryRepository(prisma);

  const createSupplierUseCase = new CreateSupplierUseCase(suppliersRepository);
  const listSuppliersUseCase = new ListSuppliersUseCase(suppliersRepository);
  const getSupplierUseCase = new GetSupplierUseCase(suppliersRepository);
  const updateSupplierUseCase = new UpdateSupplierUseCase(suppliersRepository);
  const deleteSupplierUseCase = new DeleteSupplierUseCase(suppliersRepository);
  const createSupplierProductUseCase = new CreateSupplierProductUseCase(
    suppliersRepository,
    inventoryRepository
  );
  const listSupplierProductsUseCase = new ListSupplierProductsUseCase(suppliersRepository);
  const updateSupplierProductUseCase = new UpdateSupplierProductUseCase(suppliersRepository);
  const deleteSupplierProductUseCase = new DeleteSupplierProductUseCase(suppliersRepository);

  const authGuard = createAuthGuard(env);

  app.register(
    async (instance) => {
      instance.addHook("preHandler", authGuard);

      instance.post("/", async (request, reply) => {
        const body = createSupplierBodySchema.parse(request.body);
        const { organizationId } = getTenantContext();

        const supplier = await createSupplierUseCase.execute({ organizationId, ...body });
        reply.status(201).send(toSupplierDto(supplier));
      });

      instance.get("/", async (_request, reply) => {
        const { organizationId } = getTenantContext();
        const suppliers = await listSuppliersUseCase.execute(organizationId);
        reply.send(suppliers.map(toSupplierDto));
      });

      instance.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
        const { organizationId } = getTenantContext();
        const supplier = await getSupplierUseCase.execute(request.params.id, organizationId);
        reply.send(toSupplierDto(supplier));
      });

      instance.patch<{ Params: { id: string } }>("/:id", async (request, reply) => {
        const body = updateSupplierBodySchema.parse(request.body);
        const { organizationId } = getTenantContext();
        const supplier = await updateSupplierUseCase.execute(request.params.id, organizationId, body);
        reply.send(toSupplierDto(supplier));
      });

      instance.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
        const { organizationId } = getTenantContext();
        await deleteSupplierUseCase.execute(request.params.id, organizationId);
        reply.status(204).send();
      });

      // Structured contract terms for one supplier x product pair — what the
      // future AI Assistant's ranking rule reads (docs/architecture.md §9b).
      instance.post<{ Params: { id: string } }>("/:id/products", async (request, reply) => {
        const body = createSupplierProductBodySchema.parse(request.body);
        const { organizationId } = getTenantContext();

        const supplierProduct = await createSupplierProductUseCase.execute({
          organizationId,
          supplierId: request.params.id,
          ...body,
        });
        reply.status(201).send(toSupplierProductDto(supplierProduct));
      });

      instance.get<{ Params: { id: string } }>("/:id/products", async (request, reply) => {
        const { organizationId } = getTenantContext();
        const supplierProducts = await listSupplierProductsUseCase.execute(
          request.params.id,
          organizationId
        );
        reply.send(supplierProducts.map(toSupplierProductDto));
      });

      instance.patch<{ Params: { id: string; termId: string } }>(
        "/:id/products/:termId",
        async (request, reply) => {
          const body = updateSupplierProductBodySchema.parse(request.body);
          const { organizationId } = getTenantContext();
          const supplierProduct = await updateSupplierProductUseCase.execute(
            request.params.termId,
            organizationId,
            body
          );
          reply.send(toSupplierProductDto(supplierProduct));
        }
      );

      instance.delete<{ Params: { id: string; termId: string } }>(
        "/:id/products/:termId",
        async (request, reply) => {
          const { organizationId } = getTenantContext();
          await deleteSupplierProductUseCase.execute(request.params.termId, organizationId);
          reply.status(204).send();
        }
      );
    },
    { prefix: "/api/v1/suppliers" }
  );
}
