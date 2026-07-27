import { UnauthorizedError } from "../../../shared/domain/errors.js";
import type { AuthRepository } from "../domain/auth.repository.js";
import type { PasswordHasher } from "./ports/password-hasher.port.js";
import type { TokenService } from "./ports/token-service.port.js";
import type { AuthSession } from "./auth-session.js";

export interface LoginCommand {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(command: LoginCommand): Promise<AuthSession> {
    const user = await this.authRepository.findUserByEmail(command.email);

    // Same error for "no such user" and "wrong password" — don't leak which
    // one it was.
    if (!user || !(await this.passwordHasher.verify(user.passwordHash, command.password))) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const claims = { userId: user.id, organizationId: user.organizationId, role: user.role };

    return {
      accessToken: this.tokenService.signAccessToken(claims),
      refreshToken: this.tokenService.signRefreshToken(claims),
      user,
    };
  }
}
