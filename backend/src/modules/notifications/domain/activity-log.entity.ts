export interface ActivityLog {
  id: string;
  organizationId: string;
  type: string;
  message: string;
  createdAt: Date;
}
