import type { FastifyLoggerOptions } from "fastify";
import type { PinoLoggerOptions } from "fastify/types/logger.js";

// Returned as plain options (not a pre-built Pino instance) so Fastify
// constructs its own internal logger. Passing an externally-built pino
// instance via `loggerInstance` hits a known Fastify v5 / Pino v9 type
// mismatch (FastifyBaseLogger vs Logger — missing `msgPrefix`).
export function loggerOptions(nodeEnv: string): FastifyLoggerOptions & PinoLoggerOptions {
  return {
    level: nodeEnv === "production" ? "info" : "debug",
    transport:
      nodeEnv === "production"
        ? undefined
        : { target: "pino-pretty", options: { colorize: true } },
  };
}
