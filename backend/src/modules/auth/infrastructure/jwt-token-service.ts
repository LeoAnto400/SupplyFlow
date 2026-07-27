import jwt from "jsonwebtoken";
import type { TokenClaims, TokenService } from "../application/ports/token-service.port.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";

export class JwtTokenService implements TokenService {
  constructor(
    private readonly accessSecret: string,
    private readonly refreshSecret: string
  ) {}

  signAccessToken(claims: TokenClaims): string {
    return jwt.sign(claims, this.accessSecret, { expiresIn: ACCESS_TOKEN_TTL });
  }

  signRefreshToken(claims: TokenClaims): string {
    return jwt.sign(claims, this.refreshSecret, { expiresIn: REFRESH_TOKEN_TTL });
  }

  verifyAccessToken(token: string): TokenClaims {
    return this.verify(token, this.accessSecret);
  }

  verifyRefreshToken(token: string): TokenClaims {
    return this.verify(token, this.refreshSecret);
  }

  private verify(token: string, secret: string): TokenClaims {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string") {
      throw new Error("Unexpected string JWT payload");
    }
    return {
      userId: payload.userId as string,
      organizationId: payload.organizationId as string,
      role: payload.role as string,
    };
  }
}
