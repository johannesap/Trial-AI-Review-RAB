export type UserRole = 'superadmin' | 'satker' | 'verifikator';

export interface UserAccount {
  id: string; // 8 character ID (e.g. 19850115 / ADM88001)
  name: string;
  unit: string;
  roles: UserRole[]; // Can have 1, 2, or 3 roles
  activeRole: UserRole;
  password: string;
  isActive: boolean;
  createdAt: string;
  phone?: string;
}

export interface HierarchyItem {
  program: string;
  unitEselon1: string;
  kegiatan: string;
  unitEselon2: string;
  prioritasCheck: string;
  kro: string;
  ro: string;
}

export interface ChecklistCriterion {
  id: number;
  text: string;
  status: 'passed' | 'failed'; // AI status
  notes: string; // AI findings notes
  category?: string;
  verifierStatus: 'Lolos' | 'Ditolak'; // Verifier override per row
  verifierNotes: string; // Verifier notes per row
}

export interface SubmissionData {
  id: string;
  ticketNumber: string;
  satkerUserId: string; // 8 characters
  satkerUserName: string;
  satkerUnit: string;
  submittedAt: string;
  program: string;
  kegiatan: string;
  kro: string;
  ro: string;
  unitEselon1: string;
  unitEselon2: string;
  prioritas: string;
  rabFileName: string;
  rabFileSize: string;
  pdfDataUrl?: string;
  
  // AI LLM Analysis Result for RAB
  aiStatus: 'LOLOS' | 'TIDAK LOLOS';
  aiScore: number;
  aiReason: string;
  aiRecommendation: string;
  criteriaResults: ChecklistCriterion[];
  
  // Verifikator Review
  verificationStatus: 'Menunggu' | 'Diterima' | 'Ditolak';
  verifikatorNotes: string;
  verifiedBy?: string;
  verifiedByNip?: string;
  verifiedAt?: string;
  digitalSignatureHash?: string;
}
