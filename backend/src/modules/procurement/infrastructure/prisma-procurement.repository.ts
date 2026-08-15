import type { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../../../shared/domain/errors.js";
import type {
  CreatePurchaseOrderInput,
  ProcurementRepository,
} from "../domain/procurement.repository.js";
import type { PurchaseOrder, PurchaseOrderStatus } from "../domain/purchase-order.entity.js";

const INCLUDE_ITEMS = { items: true } as const;

export class PrismaProcurementRepository implements ProcurementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    const purchaseOrder = await this.prisma.purchaseOrder.create({
      data: {
        organizationId: input.organizationId,
        supplierId: input.supplierId,
        notes: input.notes,
        items: {
          create: input.items.map((item) => ({
            organizationId: input.organizationId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: INCLUDE_ITEMS,
    });

    return this.toPurchaseOrder(purchaseOrder);
  }

  async listPurchaseOrders(organizationId: string): Promise<PurchaseOrder[]> {
    const rows = await this.prisma.purchaseOrder.findMany({
      where: { organizationId },
      include: INCLUDE_ITEMS,
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => this.toPurchaseOrder(row));
  }

  async findPurchaseOrderById(id: string, organizationId: string): Promise<PurchaseOrder | null> {
    const row = await this.prisma.purchaseOrder.findFirst({
      where: { id, organizationId },
      include: INCLUDE_ITEMS,
    });

    return row ? this.toPurchaseOrder(row) : null;
  }

  async approvePurchaseOrder(
    id: string,
    organizationId: string,
    approvedByUserId: string
  ): Promise<PurchaseOrder> {
    const result = await this.prisma.purchaseOrder.updateMany({
      where: { id, organizationId },
      data: { status: "approved", approvedByUserId, approvedAt: new Date() },
    });

    if (result.count === 0) {
      throw new NotFoundError("PurchaseOrder", id);
    }

    const row = await this.prisma.purchaseOrder.findFirstOrThrow({
      where: { id, organizationId },
      include: INCLUDE_ITEMS,
    });

    return this.toPurchaseOrder(row);
  }

  private toPurchaseOrder(row: {
    id: string;
    organizationId: string;
    supplierId: string;
    status: PurchaseOrderStatus;
    notes: string | null;
    approvedByUserId: string | null;
    approvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    items: {
      id: string;
      purchaseOrderId: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      createdAt: Date;
    }[];
  }): PurchaseOrder {
    return {
      ...row,
      notes: row.notes ?? undefined,
      approvedByUserId: row.approvedByUserId ?? undefined,
      approvedAt: row.approvedAt ?? undefined,
    };
  }
}
