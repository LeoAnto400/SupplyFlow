import type { NotificationsRepository } from "../domain/notifications.repository.js";
import type { ActivityLog } from "../domain/activity-log.entity.js";

export class ListActivityLogUseCase {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  execute(organizationId: string): Promise<ActivityLog[]> {
    return this.notificationsRepository.listActivityLog(organizationId);
  }
}
