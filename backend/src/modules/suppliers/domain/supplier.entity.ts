export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}
