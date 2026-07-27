import type { PrismaClient } from "@prisma/client";
import type {
  AuthRepository,
  RegisterOrganizationInput,
} from "../domain/auth.repository.js";
import type { User } from "../domain/user.entity.js";
import type { Organization } from "../domain/organization.entity.js";

export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async registerOrganizationWithAdmin(
    input: RegisterOrganizationInput
  ): Promise<{ organization: Organization; user: User }> {
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: input.organizationName },
      });

      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          email: input.email,
          passwordHash: input.passwordHash,
          role: "admin",
        },
      });

      return { organization, user };
    });
  }
}
