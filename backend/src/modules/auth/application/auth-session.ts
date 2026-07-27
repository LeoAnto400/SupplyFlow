import type { User } from "../domain/user.entity.js";
import type { Organization } from "../domain/organization.entity.js";

// Shared output shape for every use case that ends in an authenticated
// session (register, login, refresh) — presentation maps this onto the
// HTTP response + refresh cookie.
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
  organization?: Organization;
}
