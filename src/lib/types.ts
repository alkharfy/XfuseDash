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
  jobTitle?: string;
  joinedAt?: any; // Firestore Timestamp
  vacationDays?: number;
  employeeId?: string;
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
  createdAt?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
  basicInfo?: {
    name?: string;
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
  writingResponsible?: string; // userId of creative or content writer
  assignedCreative?: string; // userId of assigned creative (set by PR)

  // Content Fields
  contentStatus?: 'pending' | 'in_progress' | 'completed';
  contentTasks?: ContentTask[];

  // Final Agreement & Onboarding
  finalAgreement?: FinalAgreement;
  operationalData?: OperationalData;
  leadInfo?: LeadInfo;
  scopeOfWork?: ScopeOfWork;
  kpis?: KeyPerformanceIndicators;
  accessCredentials?: AccessCredentials;
  onboardingInfo?: OnboardingInfo;
  riskManagement?: RiskManagement;
  qualityAssurance?: QualityAssurance;
  clientTickets?: ClientTicket[];
  activityLog?: ActivityLogEntry[];
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
  title: string;
  caption?: string;
  cta?: string;
  hashtags?: string;
  designNotes?: string;
  references?: string;
  brandAssets?: string[];

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
  paymentScreenshots?: { name: string; url: string; }[];
  requiredExecution?: string;
  currency?: string;
  paymentPlan?: string;
  paymentMethod?: string;
  nextPaymentDate?: any;
  serviceTerminationPolicy?: string;
}

export interface OperationalData {
  internalClientId?: string;
  preferredContactMethod?: 'whatsapp' | 'phone' | 'email';
  bestContactTime?: 'morning' | 'afternoon' | 'evening';
  clientTimezone?: string;
  alternativeContactName?: string;
  alternativeContactNumber?: string;
}

export interface LeadInfo {
  source?: 'facebook_ads' | 'instagram_ads' | 'google_ads' | 'tiktok_ads' | 'referral' | 'organic' | 'website' | 'event';
  campaignName?: string;
  firstContactDate?: any;
  lastContactDate?: any;
  pipelineStage?: 'new' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'on_hold';
  lostReason?: string;
  website?: string;
}

export interface ScopeOfWork {
  packageOrPlanName?: string;
  detailedServices?: string;
  platforms?: ('facebook' | 'instagram' | 'tiktok' | 'linkedin' | 'snapchat' | 'google')[];
  languages?: ('ar' | 'en' | 'ar_en')[];
  clientMaterials?: string[];
  photographyNeeded?: boolean;
  photographyDetails?: string;
  usp?: string;
  brandSafety?: string;
}

export interface KeyPerformanceIndicators {
  mainGoal?: 'sales' | 'bookings' | 'leads' | 'awareness';
  monthlyTargets?: string; // e.g., "100 leads, 5% CTR"
  aov?: number;
  goalTimeline?: string; // "30-day goal, 90-day goal"
}

export interface TimelineSLA {
  executionStartDate?: any;
  firstDraftDeliveryDate?: any;
  weeklySchedule?: string;
  clientResponseSLA?: string; // e.g., "4 hours"
  clientRevisionSLA?: string; // e.g., "2 days"
  allowedRevisions?: number;
}

export interface Stakeholders {
  moderatorId?: string;
  prId?: string;
  designerId?: string;
  researcherId?: string;
  accountManagerId?: string;
  clientApprovers?: { name: string; role: string }[];
}

export interface AccessCredentials {
  socialAccounts?: { platform: string; url: string; role: 'admin' | 'editor' | 'advertiser' }[];
  businessManagerId?: string;
  pixelId?: string;
  hostingInfo?: string;
}

export interface LegalDocuments {
  logoUsageApproval?: boolean;
  adLegalApproval?: boolean;
  contracts?: { name: string; url: string }[];
}

export interface OnboardingInfo {
  kickoffMeeting?: any;
  reviewMeetingSchedule?: string;
  followUpChannel?: 'whatsapp' | 'slack' | 'email';
  attendees?: string;
  timeline?: TimelineSLA;
  stakeholders?: Stakeholders;
  documents?: LegalDocuments;
}

export interface RiskManagement {
  expectedRisks?: string;
  mitigationPlan?: string;
  approvalPolicy?: string;
  escalationPolicy?: string;
}

export interface QualityAssurance {
  checklist?: string;
  ipRightsCheck?: boolean;
  toneOfVoice?: string;
  definitionOfDone?: string;
}

export interface ClientTicket {
  id: string;
  type: 'design' | 'content' | 'ad' | 'technical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetDate?: any;
  status: 'open' | 'in_progress' | 'waiting_client' | 'closed';
}

export interface ActivityLogEntry {
  timestamp: any;
  activity: string;
  userId: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'status_change' | 'new_client' | 'agreement_approved' | 'appointment' | 'task';
  message: string;
  relatedClientId?: string;
  read: boolean;
  createdAt: { seconds: number; nanoseconds: number };
}
