export type Role = 'homeowner' | 'admin';

export type PackageId = 'Property Monitoring' | 'basic' | 'silver' | 'gold' | 'vip';

export type TicketStatus =
  | 'open'
  | 'quoted'
  | 'awaiting_payment'
  | 'paid'
  | 'in_progress'
  | 'completed'
  | 'confirmed'
  | 'closed';

export type Property = {
  id: string;
  name: string;
  addressLine1: string;
  city: string;
  postcode: string;
  bedrooms: string;
  propertyType: string;
  notes: string;
};

export type Ticket = {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: TicketStatus;
  createdAt: string;
  quote?: number;
  invoiceNote?: string;
  paid?: boolean;
  rating?: number;
  customerConfirmed?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  packageId?: PackageId;
  properties: Property[];
};

export type MaintenancePackage = {
  id: PackageId;
  name: string;
  price: number;
  summary: string;
  features: string[];
  response?: string;
  schedule: string;
  materialLimit?: number;
  callLimit?: string;
  highlighted?: boolean;
};

export type GuestTicketInput = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  postcode: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
};