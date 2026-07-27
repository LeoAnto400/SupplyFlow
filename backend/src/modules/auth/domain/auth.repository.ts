import type { User } from "./user.entity.js";
import type { Organization } from "./organization.entity.js";

export interface RegisterOrganizationInput {
  organizationName: string;
  email: string;
  passwordHash: string;
}

export interface AuthRepository {
  // Global (not org-scoped) lookup — at login time we don't yet know which
  // organization the caller belongs to, that's precisely what this resolves.
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;

  // Creates the Organization and its first admin User atomically, per
  // docs/architecture.md §6 (registration has no separate "create org" step).
  registerOrganizationWithAdmin(
    input: RegisterOrganizationInput
  ): Promise<{ organization: Organization; user: User }>;
}
