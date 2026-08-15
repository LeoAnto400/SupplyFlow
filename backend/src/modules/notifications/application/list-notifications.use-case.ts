import type { NotificationsRepository } from "../domain/notifications.repository.js";
import type { Notification } from "../domain/notification.entity.js";

export class ListNotificationsUseCase {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  execute(organizationId: string): Promise<Notification[]> {
    return this.notificationsRepository.listNotifications(organizationId);
  }
}
