import type { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../../../shared/domain/errors.js";
import type {
  NotificationsRepository,
  RecordEventInput,
} from "../domain/notifications.repository.js";
import type { Notification } from "../domain/notification.entity.js";
import type { ActivityLog } from "../domain/activity-log.entity.js";

export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  recordEvent(
    input: RecordEventInput
  ): Promise<{ notification: Notification; activityLog: ActivityLog }> {
    return this.prisma.$transaction(async (tx) => {
      const notification = await tx.notification.create({ data: input });
      const activityLog = await tx.activityLog.create({ data: input });

      return { notification, activityLog };
    });
  }

  listNotifications(organizationId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  listActivityLog(organizationId: string): Promise<ActivityLog[]> {
    return this.prisma.activityLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markNotificationRead(id: string, organizationId: string): Promise<Notification> {
    const result = await this.prisma.notification.updateMany({
      where: { id, organizationId },
      data: { read: true },
    });

    if (result.count === 0) {
      throw new NotFoundError("Notification", id);
    }

    return this.prisma.notification.findFirstOrThrow({ where: { id, organizationId } });
  }
}
