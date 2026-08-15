import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import type { Env } from "./shared/config/env.js";
import { loggerOptions } from "./shared/logger/index.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { createSocketGateway } from "./plugins/socket-gateway.js";
import { registerAuthModule } from "./modules/auth/presentation/auth.routes.js";
import { registerInventoryModule } from "./modules/inventory/presentation/inventory.routes.js";
import { registerSuppliersModule } from "./modules/suppliers/presentation/suppliers.routes.js";
import { registerNotificationsModule } from "./modules/notifications/presentation/notifications.routes.js";

// Module route registration is added here one module at a time as each
// vertical slice (auth, inventory, suppliers, ...) is built.
export function buildApp(env: Env): FastifyInstance {
  const app = Fastify({ logger: loggerOptions(env.NODE_ENV) });

  app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  app.register(cookie);

  registerErrorHandler(app);

  app.get("/health", async () => ({ status: "ok" }));

  // Socket.IO attaches to app.server, which exists as soon as Fastify() is
  // constructed — no need to wait for .listen().
  const realtimeGateway = createSocketGateway(app, env);

  registerAuthModule(app, env);
  registerInventoryModule(app, env);
  registerSuppliersModule(app, env);
  registerNotificationsModule(app, env, realtimeGateway);

  return app;
}
