import type { FastifyInstance } from "fastify";
import type { Env } from "../../../shared/config/env.js";
import { prisma } from "../../../shared/prisma/client.js";
import { eventBus } from "../../../shared/event-bus/index.js";
import { getTenantContext } from "../../../shared/tenant-context/index.js";
import { createAuthGuard } from "../../../plugins/auth-guard.js";
import type { RealtimeGateway } from "../application/ports/realtime-gateway.port.js";
import { PrismaNotificationsRepository } from "../infrastructure/prisma-notifications.repository.js";
import { HandleLowStockDetectedUseCase } from "../application/handle-low-stock-detected.use-case.js";
import { ListNotificationsUseCase } from "../application/list-notifications.use-case.js";
import { ListActivityLogUseCase } from "../application/list-activity-log.use-case.js";
import { MarkNotificationReadUseCase } from "../application/mark-notification-read.use-case.js";
import {
  LOW_STOCK_DETECTED_EVENT,
  type LowStockDetectedEvent,
} from "../../inventory/application/events.js";
import type { Notification } from "../domain/notification.entity.js";
import type { ActivityLog } from "../domain/activity-log.entity.js";

function toNotificationDto(notification: Notification) {
  return {
    id: notification.id,
    type: notification.type,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt,
  };
}

function toActivityLogDto(activityLog: ActivityLog) {
  return {
    id: activityLog.id,
    type: activityLog.type,
    message: activityLog.message,
    createdAt: activityLog.createdAt,
  };
}

export function registerNotificationsModule(
  app: FastifyInstance,
  env: Env,
  realtimeGateway: RealtimeGateway
): void {
  const notificationsRepository = new PrismaNotificationsRepository(prisma);

  const handleLowStockDetectedUseCase = new HandleLowStockDetectedUseCase(
    notificationsRepository,
    realtimeGateway
  );
  const listNotificationsUseCase = new ListNotificationsUseCase(notificationsRepository);
  const listActivityLogUseCase = new ListActivityLogUseCase(notificationsRepository);
  const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationsRepository);

  // Module composition over the shared event bus, per docs/architecture.md
  // §10 — Notifications reacts to events published by Inventory (and, later,
  // other modules) without either module importing the other's internals.
  eventBus.subscribe<LowStockDetectedEvent>(LOW_STOCK_DETECTED_EVENT, (event) => {
    handleLowStockDetectedUseCase.execute(event).catch((error: unknown) => {
      app.log.error(error, "Failed to handle LowStockDetected event");
    });
  });

  const authGuard = createAuthGuard(env);

  app.register(
    async (instance) => {
      instance.addHook("preHandler", authGuard);

      instance.get("/", async (_request, reply) => {
        const { organizationId } = getTenantContext();
        const notifications = await listNotificationsUseCase.execute(organizationId);
        reply.send(notifications.map(toNotificationDto));
      });

      instance.patch<{ Params: { id: string } }>("/:id/read", async (request, reply) => {
        const { organizationId } = getTenantContext();
        const notification = await markNotificationReadUseCase.execute(
          request.params.id,
          organizationId
        );
        reply.send(toNotificationDto(notification));
      });
    },
    { prefix: "/api/v1/notifications" }
  );

  app.register(
    async (instance) => {
      instance.addHook("preHandler", authGuard);

      instance.get("/", async (_request, reply) => {
        const { organizationId } = getTenantContext();
        const activityLog = await listActivityLogUseCase.execute(organizationId);
        reply.send(activityLog.map(toActivityLogDto));
      });
    },
    { prefix: "/api/v1/activity" }
  );
}
