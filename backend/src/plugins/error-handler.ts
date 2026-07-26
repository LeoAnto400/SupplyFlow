import type { FastifyInstance } from "fastify";
import { DomainError, NotFoundError } from "../shared/domain/errors.js";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof NotFoundError) {
      reply.status(404).send({ error: error.message });
      return;
    }

    if (error instanceof DomainError) {
      reply.status(400).send({ error: error.message });
      return;
    }

    request.log.error(error);
    reply.status(500).send({ error: "Internal server error" });
  });
}
