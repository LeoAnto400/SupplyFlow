import type { FastifyInstance } from "fastify";
import type { Env } from "../../../shared/config/env.js";
import { prisma } from "../../../shared/prisma/client.js";
import { PrismaAuthRepository } from "../infrastructure/prisma-auth.repository.js";
import { Argon2PasswordHasher } from "../infrastructure/argon2-password-hasher.js";
import { JwtTokenService } from "../infrastructure/jwt-token-service.js";
import { RegisterOrganizationUseCase } from "../application/register-organization.use-case.js";
import { LoginUseCase } from "../application/login.use-case.js";
import { RefreshTokenUseCase } from "../application/refresh-token.use-case.js";
import type { AuthSession } from "../application/auth-session.js";
import type { User } from "../domain/user.entity.js";
import { registerBodySchema, loginBodySchema } from "./dto.js";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function toUserDto(user: User) {
  return {
    id: user.id,
    organizationId: user.organizationId,
    email: user.email,
    role: user.role,
  };
}

function toResponseBody(session: AuthSession) {
  return {
    accessToken: session.accessToken,
    user: toUserDto(session.user),
    ...(session.organization
      ? { organization: { id: session.organization.id, name: session.organization.name } }
      : {}),
  };
}

export function registerAuthModule(app: FastifyInstance, env: Env): void {
  const authRepository = new PrismaAuthRepository(prisma);
  const passwordHasher = new Argon2PasswordHasher();
  const tokenService = new JwtTokenService(env.JWT_ACCESS_SECRET, env.JWT_REFRESH_SECRET);

  const registerOrganizationUseCase = new RegisterOrganizationUseCase(
    authRepository,
    passwordHasher,
    tokenService
  );
  const loginUseCase = new LoginUseCase(authRepository, passwordHasher, tokenService);
  const refreshTokenUseCase = new RefreshTokenUseCase(authRepository, tokenService);

  app.register(
    async (instance) => {
      instance.post("/register", async (request, reply) => {
        const body = registerBodySchema.parse(request.body);
        const session = await registerOrganizationUseCase.execute(body);

        reply.setCookie(REFRESH_COOKIE, session.refreshToken, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: env.NODE_ENV === "production",
          maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
        });
        reply.status(201).send(toResponseBody(session));
      });

      instance.post("/login", async (request, reply) => {
        const body = loginBodySchema.parse(request.body);
        const session = await loginUseCase.execute(body);

        reply.setCookie(REFRESH_COOKIE, session.refreshToken, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: env.NODE_ENV === "production",
          maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
        });
        reply.send(toResponseBody(session));
      });

      instance.post("/refresh", async (request, reply) => {
        const refreshToken = request.cookies[REFRESH_COOKIE];
        if (!refreshToken) {
          reply.status(401).send({ message: "No refresh token provided" });
          return;
        }

        const session = await refreshTokenUseCase.execute(refreshToken);

        reply.setCookie(REFRESH_COOKIE, session.refreshToken, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: env.NODE_ENV === "production",
          maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
        });
        reply.send(toResponseBody(session));
      });

      instance.post("/logout", async (request, reply) => {
        reply.clearCookie(REFRESH_COOKIE, { path: "/" });
        reply.status(204).send();
      });
    },
    { prefix: "/api/v1/auth" }
  );
}
