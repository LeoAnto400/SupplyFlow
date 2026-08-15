import { Server as SocketIOServer } from "socket.io";
import type { FastifyInstance } from "fastify";
import type { Env } from "../shared/config/env.js";
import { JwtTokenService } from "../modules/auth/infrastructure/jwt-token-service.js";
import type { RealtimeGateway } from "../modules/notifications/application/ports/realtime-gateway.port.js";

// Attaches Socket.IO to the Fastify instance's underlying HTTP server —
// the concrete implementation of the Notifications module's RealtimeGateway
// port. Lives here rather than in the module's infrastructure/ folder
// because Socket.IO needs the shared HTTP server instance, only available
// at app-bootstrap time.
// Rooms are the tenant boundary for WebSockets, mirroring the organizationId
// row-scoping used on REST/DB reads — see docs/architecture.md §5.
export function createSocketGateway(app: FastifyInstance, env: Env): RealtimeGateway {
  const tokenService = new JwtTokenService(env.JWT_ACCESS_SECRET, env.JWT_REFRESH_SECRET);

  const io = new SocketIOServer(app.server, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      next(new Error("Missing auth token"));
      return;
    }

    try {
      const claims = tokenService.verifyAccessToken(token);
      socket.data.organizationId = claims.organizationId;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`org:${socket.data.organizationId as string}`);
  });

  return {
    emitToOrganization(organizationId, eventName, payload) {
      io.to(`org:${organizationId}`).emit(eventName, payload);
    },
  };
}
