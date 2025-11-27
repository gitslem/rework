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
  country?: string;
  city?: string;
  timezone?: string;
  phone?: string;
  website?: string;
  linkedin?: string;

  // Agent specific - Professional Info
  yearsOfExperience?: number;
  education?: string; // 'high-school' | 'bachelor' | 'master' | 'phd'
  languagesSpoken?: string[]; // ['English', 'Spanish', etc.]

  // Agent specific - Technical Details
  devices?: string[]; // ['Laptop', 'Desktop', 'Tablet']
  internetSpeed?: string; // 'Slow' | 'Medium' | 'Fast' | 'Very Fast'
  workingHours?: string; // 'Full-time' | 'Part-time' | 'Flexible'

  // Agent specific - Platforms & Services
  platformsExperience?: string[]; // Platforms they have experience with
  platformsAccounts?: Record<string, string>; // { 'Outlier AI': 'active', 'Alignerr': 'pending' }
  specializations?: string[]; // ['AI Training', 'Data Annotation', 'Translation']

  // Agent specific - Verification Documents (stored as URLs)
  idVerificationURL?: string;
  proofOfExperienceURLs?: string[];
  certificationURLs?: string[];

  // Statistics
  totalEarnings: number;
  completedProjects: number;
  averageRating: number;
  totalReviews: number;

  // Agent approval
  isAgentApproved: boolean;
  agentServices: string[]; // ['Outlier AI', 'Alignerr', etc.]
  agentSuccessRate: number;
  agentTotalClients: number;
  agentRating: number; // Average rating (0-5) - Deprecated, use averageRating instead
  agentVerificationStatus: 'pending' | 'verified' | 'rejected';
  agentVerifiedAt?: Timestamp;
  agentRejectedReason?: string;
  agentPricing?: { basePrice: number; currency: string }; // Pricing structure
  isFree?: boolean; // Whether the agent offers free service (default: true)
  agentPortfolio: PortfolioItem[];
  agentBio?: string; // Agent bio/description
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
  senderName?: string;
  senderEmail?: string;
  recipientName?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  saved?: boolean;
  status?: 'unread' | 'read' | 'accepted' | 'rejected';
  type?: 'service_request' | 'general' | 'payment_confirmation';
  conversationId: string;
  isReply?: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
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

// Candidate Project Management Types
export type CandidateProjectStatus = 'active' | 'pending' | 'completed' | 'cancelled';
export type ProjectActionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ProjectActionPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CandidateProject {
  id: number;
  candidate_id: number;
  agent_id: number;
  title: string;
  description?: string;
  platform?: string;
  project_url?: string;
  status: CandidateProjectStatus;
  budget?: number;
  deadline?: string;
  started_at?: string;
  completed_at?: string;
  tags: string[];
  project_metadata: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface ProjectUpdate {
  id: number;
  project_id: number;
  agent_id: number;
  week_number?: number;
  update_title: string;
  update_content: string;
  hours_completed: number;
  screen_sharing_hours: number;
  progress_percentage: number;
  blockers: string[];
  concerns?: string;
  next_steps: string[];
  attachments: string[];
  update_metadata: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface ProjectAction {
  id: number;
  project_id: number;
  creator_id: number;
  assigned_to_candidate: boolean;
  assigned_to_agent: boolean;
  title: string;
  description?: string;
  action_type?: string;
  status: ProjectActionStatus;
  priority: ProjectActionPriority;
  due_date?: string;
  scheduled_time?: string;
  duration_minutes?: number;
  platform?: string;
  platform_url?: string;
  completed_at?: string;
  completion_notes?: string;
  attachments: string[];
  action_metadata: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface CandidateProjectDetail extends CandidateProject {
  updates: ProjectUpdate[];
  actions: ProjectAction[];
  total_hours: number;
  total_screen_sharing_hours: number;
  pending_actions_count: number;
  completed_actions_count: number;
}
