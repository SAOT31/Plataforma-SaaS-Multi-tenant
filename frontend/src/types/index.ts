export type TicketType = 'Petition' | 'Complaint' | 'Claim' | 'Suggestion';
export type TicketStatus = 'Pending' | 'InProgress' | 'Resolved';
export type TicketPriority = 'Low' | 'Medium' | 'High';
export type SentimentType = 'Positive' | 'Neutral' | 'Negative';
export type UserRole = 'Admin' | 'Agent';

export interface User {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  role: UserRole;
  tenantName: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  tenantId: string;
  fullName: string;
  email: string;
  role: UserRole;
  tenantName: string;
}

export interface Ticket {
  id: string;
  tenantId: string;
  radicadoNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  sentiment: SentimentType;
  executiveSummary?: string;
  isRagDeflected: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface TicketStats {
  totalTickets: number;
  pendingTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  criticalOrHighPriorityTickets: number;
  negativeSentimentTickets: number;
  deflectedTicketsCount: number;
  deflectionRatePercentage: number;
}

export interface Article {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  category: string;
  hasEmbedding: boolean;
  isPublished: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  allowedDomain: string;
  widgetApiKey: string;
}
