export type Role = "admin" | "manager";

export interface User {
  id: string;
  organizationId: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
}
