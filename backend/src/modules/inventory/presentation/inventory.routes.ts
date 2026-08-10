import type { FastifyInstance } from "fastify";
import type { Env } from "../../../shared/config/env.js";
import { prisma } from "../../../shared/prisma/client.js";
import { eventBus } from "../../../shared/event-bus/index.js";
import { getTenantContext } from "../../../shared/tenant-context/index.js";
import { createAuthGuard } from "../../../plugins/auth-guard.js";
import { PrismaInventoryRepository } from "../infrastructure/prisma-inventory.repository.js";
import { CreateProductUseCase } from "../application/create-product.use-case.js";
import { ListProductsUseCase } from "../application/list-products.use-case.js";
import { GetProductUseCase } from "../application/get-product.use-case.js";
import { UpdateProductUseCase } from "../application/update-product.use-case.js";
import { DeleteProductUseCase } from "../application/delete-product.use-case.js";
import { RecordStockMovementUseCase } from "../application/record-stock-movement.use-case.js";
import { ListStockMovementsUseCase } from "../application/list-stock-movements.use-case.js";
import type { Product } from "../domain/product.entity.js";
import type { StockMovement } from "../domain/stock-movement.entity.js";
import {
  createProductBodySchema,
  updateProductBodySchema,
  recordStockMovementBodySchema,
} from "./dto.js";

function toProductDto(product: Product) {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    quantity: product.quantity,
    safetyThreshold: product.safetyThreshold,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function toMovementDto(movement: StockMovement) {
  return {
    id: movement.id,
    productId: movement.productId,
    delta: movement.delta,
    reason: movement.reason ?? null,
    createdAt: movement.createdAt,
  };
}

export function registerInventoryModule(app: FastifyInstance, env: Env): void {
  const inventoryRepository = new PrismaInventoryRepository(prisma);

  const createProductUseCase = new CreateProductUseCase(inventoryRepository);
  const listProductsUseCase = new ListProductsUseCase(inventoryRepository);
  const getProductUseCase = new GetProductUseCase(inventoryRepository);
  const updateProductUseCase = new UpdateProductUseCase(inventoryRepository);
  const deleteProductUseCase = new DeleteProductUseCase(inventoryRepository);
  const recordStockMovementUseCase = new RecordStockMovementUseCase(inventoryRepository, eventBus);
  const listStockMovementsUseCase = new ListStockMovementsUseCase(inventoryRepository);

  const authGuard = createAuthGuard(env);

  app.register(
    async (instance) => {
      instance.addHook("preHandler", authGuard);

      instance.post("/", async (request, reply) => {
        const body = createProductBodySchema.parse(request.body);
        const { organizationId } = getTenantContext();

        const product = await createProductUseCase.execute({ organizationId, ...body });
        reply.status(201).send(toProductDto(product));
      });

      instance.get("/", async (_request, reply) => {
        const { organizationId } = getTenantContext();
        const products = await listProductsUseCase.execute(organizationId);
        reply.send(products.map(toProductDto));
      });

      instance.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
        const { organizationId } = getTenantContext();
        const product = await getProductUseCase.execute(request.params.id, organizationId);
        reply.send(toProductDto(product));
      });

      instance.patch<{ Params: { id: string } }>("/:id", async (request, reply) => {
        const body = updateProductBodySchema.parse(request.body);
        const { organizationId } = getTenantContext();
        const product = await updateProductUseCase.execute(request.params.id, organizationId, body);
        reply.send(toProductDto(product));
      });

      instance.delete<{ Params: { id: string } }>("/:id", async (request, reply) => {
        const { organizationId } = getTenantContext();
        await deleteProductUseCase.execute(request.params.id, organizationId);
        reply.status(204).send();
      });

      // Records a stock adjustment — the event that can kick off the
      // low-stock → AI recommendation workflow (docs/architecture.md §4/§10).
      instance.post<{ Params: { id: string } }>("/:id/stock-movements", async (request, reply) => {
        const body = recordStockMovementBodySchema.parse(request.body);
        const { organizationId } = getTenantContext();

        const result = await recordStockMovementUseCase.execute({
          productId: request.params.id,
          organizationId,
          delta: body.delta,
          reason: body.reason,
        });

        reply.status(201).send({
          product: toProductDto(result.product),
          movement: toMovementDto(result.movement),
        });
      });

      instance.get<{ Params: { id: string } }>("/:id/stock-movements", async (request, reply) => {
        const { organizationId } = getTenantContext();
        const movements = await listStockMovementsUseCase.execute(request.params.id, organizationId);
        reply.send(movements.map(toMovementDto));
      });
    },
    { prefix: "/api/v1/products" }
  );
}
