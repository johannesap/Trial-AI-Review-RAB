import { UserAccount, SubmissionData } from '../types';
import { runAiRabAnalysis } from './defaultCriteria';

/**
 * Seed data pengguna dengan ID tepat 8 karakter:
 * - Super Admin (ID 8 karakter: "19850115")
 * - SatKer (ID 8 karakter: "19890422")
 * - Verifikator (ID 8 karakter: "19910718")
 * - Multi-Role (ID 8 karakter: "19871212", memegang role SatKer & Verifikator)
 */
export const INITIAL_USERS: UserAccount[] = [
  {
    id: '19850115', // 8 characters
    name: 'Budi Santoso, S.Kom., M.T.',
    unit: 'Biro Perencanaan & Keuangan',
    roles: ['superadmin'],
    activeRole: 'superadmin',
    password: 'password123',
    isActive: true,
    createdAt: '2026-01-10',
    phone: '0812-8888-0001'
  },
  {
    id: '19890422', // 8 characters
    name: 'Rina Kusuma, S.E., M.Si.',
    unit: 'Direktorat Pengelolaan Media Publik',
    roles: ['satker'],
    activeRole: 'satker',
    password: 'password123',
    isActive: true,
    createdAt: '2026-01-15',
    phone: '0813-7777-0002'
  },
  {
    id: '19910718', // 8 characters
    name: 'Ahmad Fauzi, S.E., Ak., CA',
    unit: 'Inspektorat / Verifikasi Anggaran',
    roles: ['verifikator'],
    activeRole: 'verifikator',
    password: 'password123',
    isActive: true,
    createdAt: '2026-01-18',
    phone: '0814-6666-0003'
  },
  {
    id: '19871212', // 8 characters
    name: 'Dewi Lestari, S.Sos., M.AP.',
    unit: 'Pusat Data dan Sarana Informatika',
    roles: ['satker', 'verifikator'], // 2-3 roles within 1 account
    activeRole: 'satker',
    password: 'password123',
    isActive: true,
    createdAt: '2026-01-20',
    phone: '0815-5555-0004'
  }
];

// Initial mock submission for instant demonstration
const sampleAiResult = runAiRabAnalysis(
  '059.01.GG Program Dukungan Manajemen',
  '2133 Layanan Manajemen Kinerja Internal',
  '2133.EBA Layanan Dukungan Manajemen Internal',
  '2133.EBA.994 Layanan Perkantoran',
  'RAB_Layanan_Perkantoran_2026.pdf'
);

export const INITIAL_SUBMISSIONS: SubmissionData[] = [
  {
    id: 'SUB-2026-001',
    ticketNumber: 'RAB/KOMDIGI/2026/042',
    satkerUserId: '19890422', // 8 characters
    satkerUserName: 'Rina Kusuma, S.E., M.Si.',
    satkerUnit: 'Direktorat Pengelolaan Media Publik',
    submittedAt: '22/09/2026 09:30 WIB',
    program: '059.01.GG Program Dukungan Manajemen',
    kegiatan: '2133 Layanan Manajemen Kinerja Internal',
    kro: '2133.EBA Layanan Dukungan Manajemen Internal',
    ro: '2133.EBA.994 Layanan Perkantoran',
    unitEselon1: 'Direktorat Jenderal Komunikasi Publik dan Media',
    unitEselon2: 'Direktorat Pengelolaan Media',
    prioritas: 'Bukan Prioritas Nasional',
    rabFileName: 'RAB_Layanan_Perkantoran_2026.pdf',
    rabFileSize: '1.9 MB',
    aiStatus: sampleAiResult.aiStatus,
    aiScore: sampleAiResult.aiScore,
    aiReason: sampleAiResult.aiReason,
    aiRecommendation: sampleAiResult.aiRecommendation,
    criteriaResults: sampleAiResult.criteriaResults,
    verificationStatus: 'Menunggu',
    verifikatorNotes: ''
  },
  {
    id: 'SUB-2026-002',
    ticketNumber: 'RAB/KOMDIGI/2026/048',
    satkerUserId: '19871212', // 8 characters
    satkerUserName: 'Dewi Lestari, S.Sos., M.AP.',
    satkerUnit: 'Pusat Data dan Sarana Informatika',
    submittedAt: '22/09/2026 11:15 WIB',
    program: '059.01.WA Program Penyediaan dan Tata Kelola Infrastruktur TIK',
    kegiatan: '4775 Fasilitasi dan Pengawasan Infrastruktur TIK',
    kro: '4775.PJA Infrastruktur TIK',
    ro: '4775.PJA.001 Layanan Cloud Government',
    unitEselon1: 'Badan Pengembangan SDM & Infrastruktur Digital',
    unitEselon2: 'Pusat Infrastruktur TIK',
    prioritas: 'Prioritas Nasional',
    rabFileName: 'RAB_Infrastruktur_Cloud_Gov_2026.pdf',
    rabFileSize: '2.4 MB',
    aiStatus: 'LOLOS',
    aiScore: 100,
    aiReason: 'Rincian RAB akun belanja jasa komputasi awan dan pemeliharaan server sesuai pagu alokasi dan tarif SBM.',
    aiRecommendation: 'Seluruh 20 kriteria RAB terpenuhi dan disetujui.',
    criteriaResults: sampleAiResult.criteriaResults.map(c => ({
      ...c,
      verifierStatus: 'Lolos',
      verifierNotes: 'Sesuai pagu dan standar SBM 2026.'
    })),
    verificationStatus: 'Diterima',
    verifikatorNotes: 'Dokumen RAB telah memenuhi kelayakan anggaran. Disetujui untuk diteruskan ke proses pengesahan DIPA.',
    verifiedBy: 'Ahmad Fauzi, S.E., Ak., CA',
    verifiedByNip: '19910718',
    verifiedAt: '22/09/2026 13:45 WIB',
    digitalSignatureHash: 'DIGISIG-KOMDIGI-8A4F9C21'
  }
];
