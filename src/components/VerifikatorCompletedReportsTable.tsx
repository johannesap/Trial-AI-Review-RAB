import React, { useState, useMemo } from "react";
import { SubmissionData } from "../types";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Printer,
  Eye,
  Search,
  Filter,
  ExternalLink,
  FileSpreadsheet,
  Calendar,
  Layers,
  Sparkles,
  Award,
  Clock,
  RotateCcw,
  X,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface VerifikatorCompletedReportsTableProps {
  submissions: SubmissionData[];
  onPreviewPdf: (sub: SubmissionData) => void;
  onPrintReport: (sub: SubmissionData) => void;
  onOpenReviewDetail: (sub: SubmissionData) => void;
}

export const VerifikatorCompletedReportsTable: React.FC<VerifikatorCompletedReportsTableProps> = ({ submissions, onPreviewPdf, onPrintReport, onOpenReviewDetail }) => {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Diterima" | "Ditolak">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter only completed submissions (Diterima & Ditolak)
  const completedList = useMemo(() => {
    return submissions.filter((s) => s.verificationStatus === "Diterima" || s.verificationStatus === "Ditolak");
  }, [submissions]);

  const acceptedCount = useMemo(() => {
    return completedList.filter((s) => s.verificationStatus === "Diterima").length;
  }, [completedList]);

  const rejectedCount = useMemo(() => {
    return completedList.filter((s) => s.verificationStatus === "Ditolak").length;
  }, [completedList]);

  const averageScore = useMemo(() => {
    if (completedList.length === 0) return 0;
    const total = completedList.reduce((acc, curr) => acc + (curr.aiScore || 0), 0);
    return Math.round(total / completedList.length);
  }, [completedList]);

  // Filter by status and search keyword
  const filteredData = useMemo(() => {
    return completedList.filter((item) => {
      if (statusFilter !== "ALL" && item.verificationStatus !== statusFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.ticketNumber.toLowerCase().includes(q) ||
        item.satkerUserName.toLowerCase().includes(q) ||
        item.program.toLowerCase().includes(q) ||
        item.kegiatan.toLowerCase().includes(q) ||
        item.rabFileName.toLowerCase().includes(q) ||
        (item.verifiedBy && item.verifiedBy.toLowerCase().includes(q)) ||
        (item.verifikatorNotes && item.verifikatorNotes.toLowerCase().includes(q))
      );
    });
  }, [completedList, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Completed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Berkas Selesai</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{completedList.length}</span>
              <span className="text-xs text-slate-400">Berkas Dokumen</span>
            </div>
          </div>
        </div>

        {/* Card 2: Diterima */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Diterima / Disetujui</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{acceptedCount}</span>
              <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Lolos SBM &amp; Pagu</span>
            </div>
          </div>
        </div>

        {/* Card 3: Ditolak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Ditolak / Perlu Revisi</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{rejectedCount}</span>
              <span className="text-xs text-rose-600/70 dark:text-rose-400/70">Dikembalikan ke Satker</span>
            </div>
          </div>
        </div>

        {/* Card 4: Avg Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Rata-rata Skor Kepatuhan</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{averageScore}</span>
              <span className="text-xs text-slate-400">/ 100 Standar SBM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
        {/* Table Header & Controls Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <FileCheck2 className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Daftar Laporan Berkas Dokumen Selesai Ditelaah</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Menampilkan seluruh arsip berkas usulan RAB yang berstatus Diterima atau Ditolak beserta Berita Acara hasil telaah.</p>
          </div>

          {/* Search & Sub-Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "ALL" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Semua ({completedList.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Diterima")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "Diterima" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                }`}
              >
                Diterima ({acceptedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Ditolak")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "Ditolak" ? "bg-rose-600 text-white shadow-xs" : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                }`}
              >
                Ditolak ({rejectedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tiket, satker, berkas..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No.</th>
                <th className="py-3.5 px-4 min-w-[150px]">Kode Tiket &amp; Tanggal</th>
                <th className="py-3.5 px-4 min-w-[200px]">Satuan Kerja &amp; Unit</th>
                <th className="py-3.5 px-4 min-w-[220px]">Program &amp; Kegiatan</th>
                <th className="py-3.5 px-4 min-w-[170px]">Berkas Dokumen (.PDF)</th>
                <th className="py-3.5 px-4 min-w-[150px]">Status &amp; Verifikator</th>
                <th className="py-3.5 px-4 min-w-[200px]">Evaluasi AI &amp; Catatan</th>
                <th className="py-3.5 px-4 min-w-[140px] text-center">Report &amp; Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const isAccepted = item.verificationStatus === "Diterima";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* 1. No */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-xs">{index + 1}</td>

                      {/* 2. Kode Tiket & Tanggal */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-cyan-700 dark:text-cyan-400 block text-xs">{item.ticketNumber}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{item.submittedAt}</span>
                        </span>
                      </td>

                      {/* 3. Satuan Kerja & Unit */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block text-xs truncate max-w-[220px]">{item.satkerUserName}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[220px]">{item.unitEselon1 || "Kementerian Komdigi"}</span>
                      </td>

                      {/* 4. Program & Kegiatan */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px] line-clamp-1">{item.kegiatan || item.program}</span>
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono block mt-0.5">
                          Output: {item.kro || "-"} &bull; {item.ro || "-"}
                        </span>
                      </td>

                      {/* 5. Berkas Dokumen RAB */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 shrink-0">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[150px] text-[11px]" title={item.rabFileName}>
                              {item.rabFileName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{item.rabFileSize || "2.1 MB"}</span>
                          </div>
                        </div>
                      </td>

                      {/* 6. Status & Verifikator */}
                      <td className="py-3.5 px-4">
                        {isAccepted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>DITERIMA</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>DITOLAK</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                          Oleh: <strong className="text-slate-700 dark:text-slate-300">{item.verifiedBy || "Pejabat ROCAN"}</strong>
                        </span>
                        {item.verifiedAt && <span className="text-[10px] text-slate-400 block font-mono">{item.verifiedAt}</span>}
                      </td>

                      {/* 7. Evaluasi AI & Catatan Verifikator */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                            Skor: {item.aiScore ?? 98}/100
                          </span>
                          <span className="text-[10px] text-slate-400">20 Kriteria</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic" title={item.verifikatorNotes}>
                          "{item.verifikatorNotes || "Dokumen telah diverifikasi dan disinkronkan dengan SPAN & SIMPONI."}"
                        </p>
                      </td>

                      {/* 8. Report & Aksi */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Cetak Report Berita Acara */}
                          <button
                            type="button"
                            onClick={() => onPrintReport(item)}
                            className="p-2 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="Cetak PDF Berita Acara & Laporan Akhir Digital"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Lihat PDF Berkas */}
                          <button
                            type="button"
                            onClick={() => onPreviewPdf(item)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="Pratinjau Dokumen PDF Asli"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Buka Telaah Ulang */}
                          <button
                            type="button"
                            onClick={() => onOpenReviewDetail(item)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="Buka Evaluasi 20 Kriteria / Telaah Ulang"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-xs">
                      {searchQuery ? "Tidak ada laporan dokumen yang cocok dengan kata kunci pencarian." : "Belum ada berkas usulan RAB yang berstatus Diterima atau Ditolak."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Seluruh laporan pada tabel ini telah dilengkapi Berita Acara dan Tanda Tangan Digital BSrE Komdigi.</span>
          </div>
          <span>
            Menampilkan {filteredData.length} dari {completedList.length} laporan selesai
          </span>
        </div>
      </div>
    </div>
  );
};
