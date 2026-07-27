import type { AuthRepository } from "../domain/auth.repository.js";
import type { PasswordHasher } from "./ports/password-hasher.port.js";
import type { TokenService } from "./ports/token-service.port.js";
import type { AuthSession } from "./auth-session.js";

export interface RegisterOrganizationCommand {
  organizationName: string;
  email: string;
  password: string;
}

export class RegisterOrganizationUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(command: RegisterOrganizationCommand): Promise<AuthSession> {
    const passwordHash = await this.passwordHasher.hash(command.password);

    const { organization, user } = await this.authRepository.registerOrganizationWithAdmin({
      organizationName: command.organizationName,
      email: command.email,
      passwordHash,
    });

    const claims = { userId: user.id, organizationId: organization.id, role: user.role };

    return {
      accessToken: this.tokenService.signAccessToken(claims),
      refreshToken: this.tokenService.signRefreshToken(claims),
      user,
      organization,
    };
  }
}
