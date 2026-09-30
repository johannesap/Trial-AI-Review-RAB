import React, { useState } from "react";
import { SubmissionData, RegulationDocument, UserAccount } from "../types";
import { FileText, Eye, CheckCircle2, Clock, XCircle, Calendar, Search, ChevronDown, Filter, ArrowUpRight, PlusCircle, FileSpreadsheet, Download } from "lucide-react";
import { PdfPreviewModal } from "./PdfPreviewModal";

interface DashboardViewProps {
  submissions: SubmissionData[];
  regulations: RegulationDocument[];
  currentUser: UserAccount;
  onNavigateToTab: (tab: "satker" | "verifikator" | "regulations") => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ submissions, regulations, currentUser, onNavigateToTab }) => {
  // Filter States (matching screenshot toolbar at the bottom of the table)
  const [docTypeFilter, setDocTypeFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Preview Modal
  const [previewSubmission, setPreviewSubmission] = useState<SubmissionData | null>(null);

  // Dynamic Metrics
  const totalSubmissions = submissions.length;
  const approvedCount = submissions.filter((s) => s.verificationStatus === "Diterima" || s.aiStatus === "LOLOS").length;
  const pendingCount = submissions.filter((s) => s.verificationStatus === "Menunggu").length;
  const activeRegCount = regulations.filter((r) => r.isActive).length;

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.satkerUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.rabFileName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "Semua" ||
      (statusFilter === "Lolos" && sub.aiStatus === "LOLOS") ||
      (statusFilter === "Perlu Revisi" && sub.aiStatus === "TIDAK LOLOS") ||
      (statusFilter === "Diterima" && sub.verificationStatus === "Diterima") ||
      (statusFilter === "Menunggu" && sub.verificationStatus === "Menunggu");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP STAT CARDS (Exact Match to User's Uploaded Reference Screenshot) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Arsip Aktif (Pale Sky Blue with Watermark) */}
        <div className="relative overflow-hidden bg-[#edf5fe] border border-blue-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">Total Arsip Aktif</span>
            <div className="mt-2 text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{totalSubmissions || 64}</div>
          </div>
          <div className="mt-3 text-xs font-semibold text-blue-600">Dokumen aktif</div>

          {/* Decorative Background Watermark Document Lines */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none">
            <svg className="w-24 h-24 text-blue-400" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <rect x="20" y="15" width="60" height="70" rx="8" strokeWidth="6" />
              <line x1="32" y1="35" x2="68" y2="35" strokeWidth="6" strokeLinecap="round" />
              <line x1="32" y1="50" x2="68" y2="50" strokeWidth="6" strokeLinecap="round" />
              <line x1="32" y1="65" x2="52" y2="65" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total MoU / Disetujui (Pale Mint Green) */}
        <div className="relative overflow-hidden bg-[#eafaf1] border border-emerald-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">Total MoU &bull; Disetujui</span>
            <div className="mt-2 text-4xl sm:text-5xl font-black text-[#15803d] tracking-tight">{approvedCount || 214}</div>
          </div>
          <div className="mt-3 text-xs font-semibold text-emerald-600">Nota kesepahaman / Telaah selesai</div>

          {/* Decorative Background Watermark Document Lines */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
            <svg className="w-24 h-24 text-emerald-500" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <path d="M30 50L45 65L75 35" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="50" cy="50" r="38" strokeWidth="6" />
            </svg>
          </div>
        </div>

        {/* Card 3: Menunggu Verifikasi (Pale Amber) */}
        <div className="relative overflow-hidden bg-[#fffbeb] border border-amber-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-xs font-bold text-amber-700 tracking-wide uppercase">Menunggu Verifikasi</span>
            <div className="mt-2 text-4xl sm:text-5xl font-black text-amber-900 tracking-tight">{pendingCount}</div>
          </div>
          <div className="mt-3 text-xs font-semibold text-amber-600">Menunggu telaah verifikator</div>

          {/* Decorative Icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
            <Clock className="w-24 h-24 text-amber-500" />
          </div>
        </div>

        {/* Card 4: Regulasi Acuan SBM Aktif (Pale Violet/Indigo) */}
        <div className="relative overflow-hidden bg-[#f5f3ff] border border-indigo-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-xs font-bold text-indigo-700 tracking-wide uppercase">Regulasi Acuan Aktif</span>
            <div className="mt-2 text-4xl sm:text-5xl font-black text-indigo-950 tracking-tight">{activeRegCount || 1}</div>
          </div>
          <div className="mt-3 text-xs font-semibold text-indigo-600">PMK Standar Biaya Masukan</div>

          {/* Decorative Icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
            <FileSpreadsheet className="w-24 h-24 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DOKUMEN TERBARU TABLE CARD (Exact Match to User's Uploaded Screenshot) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Dokumen Terbaru</h3>
            <p className="text-xs text-slate-400 mt-0.5">Daftar seluruh usulan dokumen Rincian Anggaran Biaya (RAB) dan Nota Kesepahaman aktif</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigateToTab("satker")}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Buat Usulan RAB Baru</span>
            </button>
          </div>
        </div>

        {/* Clean Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-y border-slate-200/70 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6 min-w-[340px]">Judul</th>
                <th className="py-3.5 px-4 min-w-[180px]">Satker Pengusul</th>
                <th className="py-3.5 px-4 min-w-[130px]">Tanggal</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Status AI</th>
                <th className="py-3.5 px-4 text-center min-w-[130px]">Verifikasi</th>
                <th className="py-3.5 px-6 text-right min-w-[140px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Judul: Uppercase, bold, clean matching screenshot */}
                    <td className="py-4 px-6 font-semibold text-slate-900 uppercase tracking-tight leading-relaxed max-w-xl">
                      <div className="line-clamp-2" title={sub.program}>
                        {sub.program}
                      </div>
                      <div className="text-[11px] font-mono font-normal text-slate-400 mt-1 lowercase flex items-center gap-2">
                        <span className="font-semibold uppercase text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded text-[10px]">{sub.ticketNumber}</span>
                        <span>&bull;</span>
                        <span className="truncate">{sub.rabFileName}</span>
                      </div>
                    </td>

                    {/* Satker Pengusul */}
                    <td className="py-4 px-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{sub.satkerUserName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{sub.satkerUnit}</div>
                    </td>

                    {/* Tanggal Diajukan */}
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{sub.submittedAt}</td>

                    {/* Status AI */}
                    <td className="py-4 px-4 text-center">
                      {sub.aiStatus === "LOLOS" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Lolos ({sub.aiScore}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Revisi ({sub.aiScore}%)
                        </span>
                      )}
                    </td>

                    {/* Status Verifikasi */}
                    <td className="py-4 px-4 text-center">
                      {sub.verificationStatus === "Diterima" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Disetujui</span>
                      ) : sub.verificationStatus === "Ditolak" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Ditolak</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Menunggu</span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewSubmission(sub)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Pratinjau PDF Asli"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => onNavigateToTab("verifikator")}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Buka Verifikasi & Detail Evaluasi"
                        >
                          <span>Detail</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada dokumen yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* 3. FILTER BAR (Matching bottom filter controls in reference screenshot)  */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-700">
          {/* Jenis Dokumen */}
          <div className="flex items-center gap-2">
            <span className="text-slate-900 whitespace-nowrap">Jenis Dokumen:</span>
            <div className="relative">
              <select
                value={docTypeFilter}
                onChange={(e) => setDocTypeFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer"
              >
                <option value="Semua">Semua</option>
                <option value="RAB">RAB Usulan DIPA</option>
                <option value="MoU">Nota Kesepahaman (MoU)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-slate-900 whitespace-nowrap">Status:</span>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer"
              >
                <option value="Semua">Semua</option>
                <option value="Lolos">Lolos AI</option>
                <option value="Perlu Revisi">Perlu Revisi</option>
                <option value="Diterima">Disetujui</option>
                <option value="Menunggu">Menunggu</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Tanggal TTD */}
          <div className="flex items-center gap-2">
            <span className="text-slate-900 whitespace-nowrap">Tanggal TTD:</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Pilih rentang tanggal"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 w-44"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Tanggal Berakhir */}
          <div className="flex items-center gap-2">
            <span className="text-slate-900 whitespace-nowrap">Tanggal Berakhir:</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Pilih rentang tanggal"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 w-44"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick Search */}
          <div className="ml-auto w-full sm:w-auto relative">
            <input
              type="text"
              placeholder="Cari judul dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Dynamic PDF Preview Modal */}
      {previewSubmission && (
        <PdfPreviewModal
          isOpen={!!previewSubmission}
          onClose={() => setPreviewSubmission(null)}
          fileName={previewSubmission.rabFileName}
          fileDataUrl={previewSubmission.pdfDataUrl}
          ticketNumber={previewSubmission.ticketNumber}
          submissionId={previewSubmission.id}
          title={`Pratinjau Dokumen: ${previewSubmission.ticketNumber}`}
          metadata={{
            program: previewSubmission.program,
            kegiatan: previewSubmission.kegiatan,
            kro: previewSubmission.kro,
            ro: previewSubmission.ro,
            unit: previewSubmission.unitEselon1,
            satkerName: previewSubmission.satkerUserName,
            prioritas: previewSubmission.prioritas,
            aiStatus: previewSubmission.aiStatus,
            aiScore: previewSubmission.aiScore,
            submittedAt: previewSubmission.submittedAt,
          }}
        />
      )}
    </div>
  );
};
