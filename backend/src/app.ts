import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import type { Env } from "./shared/config/env.js";
import { loggerOptions } from "./shared/logger/index.js";
import { registerErrorHandler } from "./plugins/error-handler.js";

// Module route registration is added here one module at a time as each
// vertical slice (auth, inventory, suppliers, ...) is built. Empty for now —
// this is scaffolding, not feature code.
export function buildApp(env: Env): FastifyInstance {
  const app = Fastify({ logger: loggerOptions(env.NODE_ENV) });

  app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });

  registerErrorHandler(app);

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
