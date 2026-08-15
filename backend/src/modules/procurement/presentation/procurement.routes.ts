import type { FastifyInstance } from "fastify";
import type { Env } from "../../../shared/config/env.js";
import { prisma } from "../../../shared/prisma/client.js";
import { getTenantContext } from "../../../shared/tenant-context/index.js";
import { createAuthGuard } from "../../../plugins/auth-guard.js";
import { PrismaInventoryRepository } from "../../inventory/infrastructure/prisma-inventory.repository.js";
import { PrismaSuppliersRepository } from "../../suppliers/infrastructure/prisma-suppliers.repository.js";
import { PrismaProcurementRepository } from "../infrastructure/prisma-procurement.repository.js";
import { RecommendSuppliersUseCase } from "../application/recommend-suppliers.use-case.js";
import { CreatePurchaseOrderUseCase } from "../application/create-purchase-order.use-case.js";
import { ListPurchaseOrdersUseCase } from "../application/list-purchase-orders.use-case.js";
import { GetPurchaseOrderUseCase } from "../application/get-purchase-order.use-case.js";
import { ApprovePurchaseOrderUseCase } from "../application/approve-purchase-order.use-case.js";
import type { PurchaseOrder } from "../domain/purchase-order.entity.js";
import type { RankedSupplierCandidate } from "../domain/supplier-ranking.rules.js";
import { createPurchaseOrderBodySchema } from "./dto.js";

function toPurchaseOrderDto(purchaseOrder: PurchaseOrder) {
  return {
    id: purchaseOrder.id,
    supplierId: purchaseOrder.supplierId,
    status: purchaseOrder.status,
    notes: purchaseOrder.notes ?? null,
    approvedByUserId: purchaseOrder.approvedByUserId ?? null,
    approvedAt: purchaseOrder.approvedAt ?? null,
    createdAt: purchaseOrder.createdAt,
    updatedAt: purchaseOrder.updatedAt,
    items: purchaseOrder.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };
}

function toRecommendationDto(candidate: RankedSupplierCandidate) {
  return {
    supplierId: candidate.supplierId,
    supplierProductId: candidate.supplierProductId,
    price: candidate.price,
    leadTimeDays: candidate.leadTimeDays,
    minOrderQty: candidate.minOrderQty,
    reliabilityScore: candidate.reliabilityScore,
    score: candidate.score,
  };
}

export function registerProcurementModule(app: FastifyInstance, env: Env): void {
  const inventoryRepository = new PrismaInventoryRepository(prisma);
  const suppliersRepository = new PrismaSuppliersRepository(prisma);
  const procurementRepository = new PrismaProcurementRepository(prisma);

  const recommendSuppliersUseCase = new RecommendSuppliersUseCase(suppliersRepository, inventoryRepository);
  const createPurchaseOrderUseCase = new CreatePurchaseOrderUseCase(
    procurementRepository,
    suppliersRepository,
    inventoryRepository
  );
  const listPurchaseOrdersUseCase = new ListPurchaseOrdersUseCase(procurementRepository);
  const getPurchaseOrderUseCase = new GetPurchaseOrderUseCase(procurementRepository);
  const approvePurchaseOrderUseCase = new ApprovePurchaseOrderUseCase(procurementRepository);

  const authGuard = createAuthGuard(env);

  app.register(
    async (instance) => {
      instance.addHook("preHandler", authGuard);

      // Deterministic supplier ranking for a product — the "Rules" step of
      // docs/architecture.md §9b, ahead of the (future) AI Assistant's RAG
      // explanation layer.
      instance.get<{ Params: { productId: string } }>(
        "/recommendations/:productId",
        async (request, reply) => {
          const { organizationId } = getTenantContext();
          const recommendations = await recommendSuppliersUseCase.execute(
            request.params.productId,
            organizationId
          );
          reply.send(recommendations.map(toRecommendationDto));
        }
      );

      instance.post("/", async (request, reply) => {
        const body = createPurchaseOrderBodySchema.parse(request.body);
        const { organizationId } = getTenantContext();

        const purchaseOrder = await createPurchaseOrderUseCase.execute({ organizationId, ...body });
        reply.status(201).send(toPurchaseOrderDto(purchaseOrder));
      });

      instance.get("/", async (_request, reply) => {
        const { organizationId } = getTenantContext();
        const purchaseOrders = await listPurchaseOrdersUseCase.execute(organizationId);
        reply.send(purchaseOrders.map(toPurchaseOrderDto));
      });

      instance.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
        const { organizationId } = getTenantContext();
        const purchaseOrder = await getPurchaseOrderUseCase.execute(request.params.id, organizationId);
        reply.send(toPurchaseOrderDto(purchaseOrder));
      });

      instance.post<{ Params: { id: string } }>("/:id/approve", async (request, reply) => {
        const { organizationId, userId } = getTenantContext();
        const purchaseOrder = await approvePurchaseOrderUseCase.execute(
          request.params.id,
          organizationId,
          userId
        );
        reply.send(toPurchaseOrderDto(purchaseOrder));
      });
    },
    { prefix: "/api/v1/purchase-orders" }
  );
}
