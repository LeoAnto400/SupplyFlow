import type { FastifyRequest, FastifyReply, preHandlerAsyncHookHandler } from "fastify";
import { UnauthorizedError } from "../shared/domain/errors.js";
import { enterTenantContext } from "../shared/tenant-context/index.js";
import { JwtTokenService } from "../modules/auth/infrastructure/jwt-token-service.js";
import type { Env } from "../shared/config/env.js";

// Attach to any protected route via `{ preHandler: authGuard }`. Verifies the
// access token and populates the tenant context (userId/organizationId/role)
// that repositories read from — see docs/architecture.md §7.
export function createAuthGuard(env: Env): preHandlerAsyncHookHandler {
  const tokenService = new JwtTokenService(env.JWT_ACCESS_SECRET, env.JWT_REFRESH_SECRET);

  return async function authGuard(request: FastifyRequest, _reply: FastifyReply) {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed Authorization header");
    }

    const token = header.slice("Bearer ".length);

    try {
      const claims = tokenService.verifyAccessToken(token);
      enterTenantContext(claims);
    } catch {
      throw new UnauthorizedError("Invalid or expired access token");
    }
  };
}
