export interface Notification {
  id: string;
  organizationId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
