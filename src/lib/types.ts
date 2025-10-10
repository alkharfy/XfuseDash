export type UserRole = 'admin' | 'moderator' | 'pr' | 'market_researcher' | 'creative' | 'content';

export interface User {
  id: string; // Ensure id is part of the type for consistency
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: any; // Firestore Timestamp
  active: boolean;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  courses?: string[];
  salary?: number;
  attendanceDays?: number;
  absenceDays?: number;
  directManagerId?: string; // userId of direct manager
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  businessName: string;
  businessField: string;
  moderatorId: string; // This was registeredBy
  socialMediaLinks?: string;
  transferDate?: any; // Firestore Timestamp
  status?: 'pending' | 'in_progress' | 'under_review' | 'completed';
  servicesOffered?: string;

  registeredBy: string; // userId of who created the entry (can be admin or moderator)
  registeredAt: any; // Firestore Timestamp
  basicInfo?: {
    email?: string;
    address?: string;
    notes?: string;
  };
  
  // PR Fields
  assignedToPR?: string; // userId
  prStatus?: 'pending' | 'in_progress' | 'under_review' | 'completed';
  prAppointments?: Appointment[];
  transferStatus?: 'active' | 'bad_client' | 'approved' | 'converted';
  serviceRequests: {
    marketResearch: boolean;
    content: boolean;
    creative: boolean;
    aiVideo?: boolean;
    ads?: boolean;
  };

  // Market Researcher Fields
  marketResearchFiles?: MarketResearchFile[];
  researcherComments?: string;
  researchStatus?: 'pending' | 'in_progress' | 'completed';
  marketResearchSummary?: string;

  // Creative Fields
  creativeStatus?: 'in_progress' | 'completed' | 'cancelled';
  creativeNotes?: string;
  contentCalendar?: CalendarEntry[];

  // Content Fields
  contentStatus?: 'pending' | 'in_progress' | 'completed';
  contentTasks?: ContentTask[];

  // Final Agreement
  finalAgreement?: FinalAgreement;
}

export interface Appointment {
  date: any; // Firestore Timestamp
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export type MarketResearchFileCategory = 'creative' | 'copywriter' | 'media_buyer' | 'manager' | 'client';

export interface MarketResearchFile {
  fileName: string;
  fileUrl: string;
  uploadedAt: any; // Firestore Timestamp
  uploadedBy: string; // userId
  category: MarketResearchFileCategory; // New field
}

export interface CalendarEntry {
  id: string;
  date: any; // Firestore Timestamp
  
  // Planning
  platform?: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'x' | 'stories' | 'reels' | 'shorts';
  format?: 'image' | 'carousel' | 'reels' | 'video' | 'story' | 'text' | 'link' | 'live';
  postGoal?: 'awareness' | 'engagement' | 'traffic' | 'leads' | 'sales' | 'retention';
  contentPillar?: 'educational' | 'awareness' | 'entertainment' | 'offer' | 'social_proof' | 'behind_scenes' | 'brand_values';
  campaign?: string;
  targetAudience?: string;
  language?: 'ar' | 'en' | 'ar_en';

  // Creative & Copy
  title?: string;
  caption?: string;
  cta?: 'whatsapp' | 'book_now' | 'shop_now' | 'learn_more' | 'subscribe';
  hashtags?: string;
  designNotes?: string;
  references?: string;
  brandAssets?: string[];
  music?: string;
  script?: string;

  // Technical Specs
  dimensions?: '1:1' | '4:5' | '9:16' | '16:9';
  videoDuration?: number;
  exportPreset?: string;
  subtitles?: boolean;

  // Workflow
  designer?: string; // User ID
  writer?: string; // User ID
  versions?: { url: string; name: string }[];
  revisionRounds?: number;
  approvalStatus?: 'draft' | 'review' | 'with_client' | 'approved' | 'rejected';
  reviewer?: string; // User ID
  reviewDate?: any; // Firestore Timestamp
  reviewNotes?: string;
  
  // Publishing
  publishMethod?: 'manual' | 'scheduled' | 'tool';
  schedulingTool?: 'meta' | 'hootsuite' | 'buffer' | 'native';
  postUrl?: string;
  isBoosted?: boolean;
  boostBudget?: number;
  utm?: string;

  // Performance
  reach?: number;
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  ctr?: number;
  cpc?: number;
  cpl?: number;
  roas?: number;
  performanceNotes?: string;

  // Original simple fields (can be deprecated or mapped to new fields)
  idea?: string; // Mapped to title
  status?: string; // Mapped to approvalStatus
}


export interface ContentTask {
  title: string;
  dueDate: any; // Firestore Timestamp
  status: string;
  assignedTo: string;
}

export interface FinalAgreement {
  approved: boolean;
  agreementDetails: string;
  duration: number; // in months
  startDate: any; // Firestore Timestamp
  approvedBy: string; // userId
  approvedAt: any; // Firestore Timestamp
  agreedPrice?: number;
  firstPayment?: number;
  paymentScreenshotUrl?: string;
  requiredExecution?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  relatedClientId: string;
  read: boolean;
  createdAt: any; // Firestore Timestamp
}
