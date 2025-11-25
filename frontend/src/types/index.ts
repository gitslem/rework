import { Timestamp } from 'firebase/firestore';

export type UserRole = 'candidate' | 'agent' | 'admin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
  isActive: boolean;
  isVerified: boolean;
  isCandidateApproved: boolean;
  candidateApprovedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Profile {
  uid: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatarURL?: string;
  location?: string;
  phone?: string;
  website?: string;
  linkedin?: string;

  // Statistics
  totalEarnings: number;
  completedProjects: number;
  averageRating: number;
  totalReviews: number;

  // Agent specific
  isAgentApproved: boolean;
  agentServices: string[]; // ['Outlier AI', 'Alignerr', etc.]
  agentSuccessRate: number;
  agentTotalClients: number;
  agentVerificationStatus: 'pending' | 'verified' | 'rejected';
  agentVerifiedAt?: Timestamp;
  agentPricing: Record<string, number>; // { 'Outlier AI': 100, 'Alignerr': 75 }
  agentPortfolio: PortfolioItem[];
  paypalEmail?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  platform: string;
  imageURL?: string;
  date: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject?: string;
  message: string;
  isRead: boolean;
  conversationId: string;
  createdAt: Timestamp;
}

export interface ServiceRequest {
  id: string;
  candidateId: string;
  agentId: string;
  platform: string;
  serviceType: string;
  amount: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  refundPolicy: string;

  // Payment
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paypalTransactionId?: string;
  paypalPayerEmail?: string;

  // Success tracking
  platformApprovalStatus: 'pending' | 'approved' | 'rejected';
  platformApprovedAt?: Timestamp;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface Review {
  id: string;
  serviceRequestId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
}

export interface AnalyticsData {
  totalUsers: number;
  totalCandidates: number;
  totalAgents: number;
  totalServiceRequests: number;
  totalRevenue: number;
  averageSuccessRate: number;
  topAgents: Array<{ uid: string; name: string; revenue: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: Timestamp }>;
}
