import type { LowStockDetectedEvent } from "../../inventory/application/events.js";
import type { NotificationsRepository } from "../domain/notifications.repository.js";
import type { RealtimeGateway } from "./ports/realtime-gateway.port.js";

const LOW_STOCK_NOTIFICATION_TYPE = "low-stock";

// Subscribed to Inventory's LOW_STOCK_DETECTED_EVENT on the shared event bus
// — this is the module composition described in docs/architecture.md §10:
// persist Notification + ActivityLog, then push over the org's WS room.
export class HandleLowStockDetectedUseCase {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly realtimeGateway: RealtimeGateway
  ) {}

  async execute(event: LowStockDetectedEvent): Promise<void> {
    const message = `${event.productName} is below its safety threshold (quantity: ${event.quantity}, threshold: ${event.safetyThreshold})`;

    const { notification } = await this.notificationsRepository.recordEvent({
      organizationId: event.organizationId,
      type: LOW_STOCK_NOTIFICATION_TYPE,
      message,
    });

    this.realtimeGateway.emitToOrganization(event.organizationId, LOW_STOCK_NOTIFICATION_TYPE, {
      notificationId: notification.id,
      productId: event.productId,
      productName: event.productName,
      quantity: event.quantity,
      safetyThreshold: event.safetyThreshold,
      message,
      createdAt: notification.createdAt,
    });
  }
}
