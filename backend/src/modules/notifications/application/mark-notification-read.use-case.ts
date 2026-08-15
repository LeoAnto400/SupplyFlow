import type { NotificationsRepository } from "../domain/notifications.repository.js";
import type { Notification } from "../domain/notification.entity.js";

export class MarkNotificationReadUseCase {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  execute(id: string, organizationId: string): Promise<Notification> {
    return this.notificationsRepository.markNotificationRead(id, organizationId);
  }
}
