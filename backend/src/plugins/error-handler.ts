import type { FastifyError, FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { DomainError } from "../shared/domain/errors.js";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler<FastifyError>((error, request, reply) => {
    if (error instanceof DomainError) {
      reply.status(error.statusCode).send({ message: error.message });
      return;
    }

    if (error instanceof ZodError) {
      reply.status(400).send({ message: error.issues[0]?.message ?? "Invalid request" });
      return;
    }

    if (error.validation) {
      reply.status(400).send({ message: error.message });
      return;
    }

    request.log.error(error);
    reply.status(500).send({ message: "Internal server error" });
  });
}
