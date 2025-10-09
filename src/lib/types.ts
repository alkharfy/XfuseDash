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
  registeredBy: string; // userId of moderator
  registeredAt: any; // Firestore Timestamp
  basicInfo: {
    email: string;
    address: string;
    notes: string;
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

export interface MarketResearchFile {
  fileName: string;
  fileUrl: string;
  uploadedAt: any; // Firestore Timestamp
  uploadedBy: string; // userId
}

export interface CalendarEntry {
  date: any; // Firestore Timestamp
  idea: string;
  status: string;
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
