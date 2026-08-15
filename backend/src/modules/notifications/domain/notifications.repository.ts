import type { Notification } from "./notification.entity.js";
import type { ActivityLog } from "./activity-log.entity.js";

export interface RecordEventInput {
  organizationId: string;
  type: string;
  message: string;
}

export interface NotificationsRepository {
  // Persists the Notification and ActivityLog rows for one domain event
  // together — see docs/architecture.md §5 ("persist Notification +
  // ActivityLog").
  recordEvent(input: RecordEventInput): Promise<{ notification: Notification; activityLog: ActivityLog }>;

  listNotifications(organizationId: string): Promise<Notification[]>;
  listActivityLog(organizationId: string): Promise<ActivityLog[]>;
  markNotificationRead(id: string, organizationId: string): Promise<Notification>;
}
