import { UnauthorizedError } from "../../../shared/domain/errors.js";
import type { AuthRepository } from "../domain/auth.repository.js";
import type { TokenService } from "./ports/token-service.port.js";
import type { AuthSession } from "./auth-session.js";

export class RefreshTokenUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(refreshToken: string): Promise<AuthSession> {
    let claims;
    try {
      claims = this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Re-read the user rather than trusting the token's stale claims — picks
    // up role changes and catches users deleted since the token was issued.
    const user = await this.authRepository.findUserById(claims.userId);
    if (!user) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const freshClaims = { userId: user.id, organizationId: user.organizationId, role: user.role };

    return {
      accessToken: this.tokenService.signAccessToken(freshClaims),
      refreshToken: this.tokenService.signRefreshToken(freshClaims),
      user,
    };
  }
}
