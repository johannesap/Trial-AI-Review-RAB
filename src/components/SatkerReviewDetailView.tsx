import React, { useState } from "react";
import { UserAccount, SubmissionData, RegulationDocument } from "../types";
import { runAiRabAnalysis } from "../data/defaultCriteria";
import { inspectUploadedRabDocument } from "../utils/pdfInspector";
import { storePdfBlob } from "../utils/pdfStorage";
import { FileSpreadsheet, Upload, Eye, CheckCircle2, XCircle, Sparkles, Printer, ChevronDown, ChevronUp, Scale, Clock, ArrowLeft, Loader2, FileCheck, Check, AlertCircle } from "lucide-react";

interface SatkerReviewDetailViewProps {
  submission: SubmissionData;
  currentUser: UserAccount;
  regulations?: RegulationDocument[];
  onBack: () => void;
  onUpdateSubmission?: (updated: SubmissionData) => void;
  onPreviewPdf: (sub: SubmissionData) => void;
  onPrintReport: (item: { submission: SubmissionData; reportType: "ai-result" | "verified-report" }) => void;
}

export const SatkerReviewDetailView: React.FC<SatkerReviewDetailViewProps> = ({ submission, currentUser, regulations = [], onBack, onUpdateSubmission, onPreviewPdf, onPrintReport }) => {
  const [currentSub, setCurrentSub] = useState<SubmissionData>(submission);
  const [isUnifiedSectionCollapsed, setIsUnifiedSectionCollapsed] = useState(false);

  // Reupload states
  const [reuploadFile, setReuploadFile] = useState<File | null>(null);
  const [reuploadFileName, setReuploadFileName] = useState<string>("");
  const [reuploadFileSize, setReuploadFileSize] = useState<string>("");
  const [reuploadBlobUrl, setReuploadBlobUrl] = useState<string | undefined>(undefined);
  const [reuploadNotes, setReuploadNotes] = useState<string>("");
  const [isReuploading, setIsReuploading] = useState<boolean>(false);
  const [reuploadSuccessMessage, setReuploadSuccessMessage] = useState<string | null>(null);
  const [reuploadErrorMessage, setReuploadErrorMessage] = useState<string | null>(null);

  const criteriaList = Array.isArray(currentSub.criteriaResults) ? currentSub.criteriaResults : [];
  const passedCount = criteriaList.filter((c) => c.status === "passed").length;
  const verifierPassedCount = criteriaList.filter((c) => c.verifierStatus === "Lolos").length;
  const verifierRejectedCount = criteriaList.filter((c) => c.verifierStatus === "Ditolak").length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setReuploadErrorMessage("Hanya file berekstensi PDF (.pdf) yang diperbolehkan untuk dokumen RAB.");
      return;
    }

    setReuploadErrorMessage(null);
    setReuploadFile(file);
    setReuploadFileName(file.name);
    setReuploadFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    const blobUrl = URL.createObjectURL(file);
    setReuploadBlobUrl(blobUrl);
  };

  const handleExecuteReupload = async () => {
    if (!reuploadFile && !reuploadNotes.trim()) {
      setReuploadErrorMessage("Silakan pilih berkas PDF baru hasil perbaikan atau masukkan catatan revisi.");
      return;
    }

    setIsReuploading(true);
    setReuploadErrorMessage(null);

    try {
      const finalFileName = reuploadFileName || currentSub.rabFileName;
      const finalFileSize = reuploadFileSize || currentSub.rabFileSize;
      const finalPdfUrl = reuploadBlobUrl || currentSub.pdfDataUrl;

      let analysis: any = null;

      if (reuploadFile) {
        await storePdfBlob(currentSub.id, reuploadFile);
        await storePdfBlob(currentSub.ticketNumber, reuploadFile);
        if (finalFileName) {
          await storePdfBlob(finalFileName, reuploadFile);
        }

        try {
          analysis = await inspectUploadedRabDocument(reuploadFile, finalFileName, finalFileSize, currentSub.program, currentSub.kegiatan, currentSub.kro, currentSub.ro, regulations);
        } catch (err) {
          console.warn("inspectUploadedRabDocument error during reupload, fallback to runAiRabAnalysis:", err);
          analysis = runAiRabAnalysis(currentSub.program, currentSub.kegiatan, currentSub.kro, currentSub.ro, finalFileName, regulations);
        }
      } else {
        analysis = {
          aiStatus: currentSub.aiStatus,
          aiScore: currentSub.aiScore,
          aiReason: currentSub.aiReason,
          aiRecommendation: currentSub.aiRecommendation,
          criteriaResults: currentSub.criteriaResults,
          activeRegulationTitle: currentSub.activeRegulationTitle,
        };
      }

      const nowFormatted = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) + " WIB";
      const userLabel = `${currentUser.name} (${currentUser.id})`;
      const existingAudit = currentSub.auditTrail || [];

      const updatedSub: SubmissionData = {
        ...currentSub,
        rabFileName: finalFileName,
        rabFileSize: finalFileSize,
        pdfDataUrl: finalPdfUrl,
        submittedAt: nowFormatted,
        aiStatus: analysis?.aiStatus || currentSub.aiStatus,
        aiScore: analysis?.aiScore ?? currentSub.aiScore,
        aiReason: analysis?.aiReason || currentSub.aiReason,
        aiRecommendation: analysis?.aiRecommendation || currentSub.aiRecommendation,
        criteriaResults: analysis?.criteriaResults || currentSub.criteriaResults,
        // Status otomatis kembali menjadi 'Menunggu' agar ROCAN memverifikasi ulang dokumen hasil perbaikan
        verificationStatus: "Menunggu",
        updatedBy: userLabel,
        auditTrail: [
          ...existingAudit,
          {
            action: "REUPLOAD" as const,
            performedBy: userLabel,
            timestamp: nowFormatted,
            details: `Reupload berkas PDF RAB revisi (${finalFileName}). Catatan perbaikan: "${reuploadNotes.trim() || "Perbaikan dokumen RAB berdasarkan evaluasi"}"`,
          },
        ],
      };

      if (onUpdateSubmission) {
        onUpdateSubmission(updatedSub);
      }

      setCurrentSub(updatedSub);
      setReuploadFile(null);
      setReuploadFileName("");
      setReuploadFileSize("");
      setReuploadBlobUrl(undefined);
      setReuploadNotes("");
      setReuploadSuccessMessage("Berkas RAB PDF berhasil di-reupload & diajukan ulang! Status pengajuan kini 'Menunggu' verifikasi ROCAN.");
      setTimeout(() => setReuploadSuccessMessage(null), 6000);
    } catch (err: any) {
      setReuploadErrorMessage("Terjadi kegagalan saat menganalisis berkas baru: " + (err?.message || "Unknown error"));
    } finally {
      setIsReuploading(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10 animate-fadeIn">
      {/* Top Return Navigation & Summary Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border border-slate-200 dark:border-slate-700 self-start sm:self-auto"
            title="Kembali ke Daftar Dokumen RAB"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Kembali ke Daftar Dokumen RAB</span>
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-cyan-700 dark:text-cyan-400">{currentSub.ticketNumber}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">&bull; Diajukan {currentSub.submittedAt}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 truncate max-w-lg" title={currentSub.rabFileName}>
              {currentSub.rabFileName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {/* Status Badge */}
          {currentSub.verificationStatus === "Menunggu" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Status: Menunggu</span>
            </span>
          )}
          {currentSub.verificationStatus === "Diterima" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Status: Diterima</span>
            </span>
          )}
          {currentSub.verificationStatus === "Ditolak" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Status: Ditolak</span>
            </span>
          )}

          {/* Preview Button */}
          <button
            type="button"
            onClick={() => onPreviewPdf(currentSub)}
            className="h-9 px-3.5 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Buka Pratinjau Dokumen PDF RAB"
          >
            <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Lihat PDF</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={() =>
              onPrintReport({
                submission: currentSub,
                reportType: currentSub.verificationStatus === "Diterima" ? "verified-report" : "ai-result",
              })
            }
            className="h-9 px-3.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Cetak Berita Acara / Laporan Telaah AI"
          >
            <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Cetak Hasil</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 1. SECTION: PEMBAHASAN TERPADU - PARAMETER HIERARKI & EVALUASI AI 20 KRITERIA */}
      {/* ============================================================= */}
      <div className="relative bg-white dark:bg-slate-900 border-2 border-blue-500 dark:border-blue-500 rounded-2xl p-6 sm:p-8 pt-8 sm:pt-9 shadow-sm transition-all space-y-6 sm:space-y-7">
        {/* Outline Label Badge Terpadu */}
        <div className="absolute -top-3.5 left-5 sm:left-6 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border bg-blue-600 text-white border-blue-400 select-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PEMBAHASAN TERPADU &bull; PARAMETER HIERARKI &amp; EVALUASI AI 20 KRITERIA</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{currentSub.ticketNumber}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">&bull; Diajukan {currentSub.submittedAt}</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider mt-1 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Parameter Hierarki Anggaran &amp; Evaluasi Kepatuhan 20 Kriteria</span>
            </h3>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsUnifiedSectionCollapsed(!isUnifiedSectionCollapsed)}
              className="h-8 px-3 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title={isUnifiedSectionCollapsed ? "Perluas Pembahasan" : "Minimize Pembahasan"}
            >
              <span>{isUnifiedSectionCollapsed ? "Perluas" : "Minimize"}</span>
              {isUnifiedSectionCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!isUnifiedSectionCollapsed && (
          <div className="space-y-6 animate-fadeIn">
            {/* BAGIAN A: PARAMETER HIERARKI & SATKER */}
            <div className="p-5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl space-y-4">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">A. Parameter Hierarki &amp; Identitas Satker Dokumen RAB</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Program */}
                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Program:</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">{currentSub.program}</span>
                </div>

                {/* 2. Kegiatan */}
                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Kegiatan:</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 block mt-0.5">{currentSub.kegiatan}</span>
                </div>

                {/* 3. KRO / RO */}
                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">3. KRO / RO:</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 block mt-0.5">
                    {currentSub.kro} &bull; {currentSub.ro}
                  </span>
                </div>

                {/* 4. Satker & Unit Eselon */}
                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">4. Satker &amp; Unit Eselon:</span>
                  <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300 block mt-0.5">{currentSub.satkerUserName}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {currentSub.unitEselon1} &bull; {currentSub.prioritas}
                  </span>
                </div>
              </div>

              {/* Dasar Regulasi Acuan AI */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Dasar Regulasi Acuan AI:</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                  <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {currentSub.activeRegulationTitle || "PMK Standar Biaya Masukan (SBM)"}
                </span>
              </div>
            </div>

            {/* STATUS & CATATAN VERIFIKATOR ROCAN */}
            <div
              className={`p-5 rounded-2xl border ${
                currentSub.verificationStatus === "Ditolak"
                  ? "bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900"
                  : currentSub.verificationStatus === "Diterima"
                    ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900"
                    : "bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900"
              } space-y-3`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-current/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Status Verifikasi Biro Perencanaan (ROCAN):</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      currentSub.verificationStatus === "Ditolak" ? "bg-rose-600 text-white" : currentSub.verificationStatus === "Diterima" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                    }`}
                  >
                    {currentSub.verificationStatus.toUpperCase()}
                  </span>
                </div>

                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {currentSub.verifiedBy ? `Diverifikasi oleh: ${currentSub.verifiedBy} (${currentSub.verifiedAt || "-"})` : "Belum diverifikasi oleh petugas verifikator"}
                </span>
              </div>

              {/* Catatan Verifikator */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">Catatan Evaluasi / Rekomendasi Verifikator:</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-current/10">
                  {currentSub.verifikatorNotes || "Belum ada catatan khusus yang diberikan verifikator."}
                </p>
              </div>

              {currentSub.verificationStatus === "Ditolak" && (
                <div className="flex items-start gap-2 pt-1 text-xs text-rose-800 dark:text-rose-300 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Dokumen ini berstatus <strong>Ditolak</strong>. Silakan periksa uraian kriteria yang tidak lolos di bawah ini, sesuaikan dokumen RAB Anda, dan unggah berkas perbaikan pada section{" "}
                    <strong>Reupload RAB PDF Baru</strong> di bagian bawah halaman ini.
                  </span>
                </div>
              )}
            </div>

            {/* BAGIAN B: HASIL PENELAAHAN AI & EVALUASI 20 KRITERIA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">B. Hasil Penelaahan AI &amp; Evaluasi Verifikator Baris per Baris (20 Kriteria)</span>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      currentSub.aiStatus === "LOLOS"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    AI: {currentSub.aiStatus} ({currentSub.aiScore}%)
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                    Verifikator: {verifierPassedCount} Lolos / {verifierRejectedCount} Ditolak
                  </span>
                </div>
              </div>

              {/* AI Summary Reasoning */}
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">Alasan AI: </strong> {currentSub.aiReason}
                </p>
                {currentSub.aiRecommendation && (
                  <p className="leading-relaxed">
                    <strong className="text-slate-900 dark:text-white">Rekomendasi AI: </strong> {currentSub.aiRecommendation}
                  </p>
                )}
              </div>

              {/* 20 Criteria Table */}
              <div className="border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-200 uppercase font-black text-xs sticky top-0 z-10 border-b-2 border-slate-300 dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3.5 w-12 text-center">No</th>
                        <th className="px-4 py-3.5 min-w-[200px]">Kriteria Wajib RAB</th>
                        <th className="px-4 py-3.5 w-28 text-center">Status AI</th>
                        <th className="px-4 py-3.5 min-w-[180px]">Catatan Bukti AI</th>
                        <th className="px-4 py-3.5 w-32 text-center bg-cyan-100/60 dark:bg-cyan-950/60 border-l border-r border-cyan-200 dark:border-cyan-800">Status Verifikator</th>
                        <th className="px-4 py-3.5 min-w-[190px] bg-slate-100/80 dark:bg-slate-800/80">Catatan Evaluasi Verifikator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {criteriaList.map((c) => {
                        const isAiLolos = c.status === "passed";
                        const isVerifLolos = c.verifierStatus === "Lolos";

                        return (
                          <tr key={c.id} className="hover:bg-sky-50/80 dark:hover:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800/80 transition-colors">
                            <td className="px-4 py-3.5 text-center font-mono text-slate-400 dark:text-slate-500 font-bold">{c.id}</td>

                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{c.text}</div>
                              {c.category && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-mono border border-slate-200 dark:border-slate-700">
                                  {c.category}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              {isAiLolos ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Lolos
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                  <XCircle className="w-3 h-3" />
                                  Ditolak
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{c.notes}</td>

                            <td className="px-4 py-3.5 text-center bg-cyan-50/20 dark:bg-cyan-950/20 border-l border-r border-cyan-100 dark:border-cyan-900/60">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  isVerifLolos
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300"
                                }`}
                              >
                                {isVerifLolos ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {c.verifierStatus || (isAiLolos ? "Lolos" : "Ditolak")}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{c.verifierNotes || <span className="text-slate-400 italic">-</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* 2. SECTION: REUPLOAD RAB PDF BARU */}
      {/* ============================================================= */}
      <div className="relative bg-white dark:bg-slate-900 border-2 border-cyan-500 dark:border-cyan-500 rounded-2xl p-6 sm:p-8 pt-8 sm:pt-9 shadow-sm space-y-6 transition-all">
        {/* Outline Label Badge */}
        <div className="absolute -top-3.5 left-5 sm:left-6 z-10 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border bg-cyan-600 text-white border-cyan-400 select-none">
          <Upload className="w-3.5 h-3.5" />
          <span>REUPLOAD BERKAS &bull; PENGAJUAN REVISI DOKUMEN RAB</span>
        </div>

        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Formulir Reupload Dokumen RAB PDF Baru (Pengajuan Revisi)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Unggah dokumen PDF RAB yang telah disempurnakan berdasarkan catatan evaluasi di atas. Sistem AI akan mengekstrak berkas baru secara otomatis dan status pengajuan akan diperbarui menjadi{" "}
            <strong>Menunggu</strong> verifikasi ulang oleh ROCAN.
          </p>
        </div>

        {/* Success Banner */}
        {reuploadSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{reuploadSuccessMessage}</span>
          </div>
        )}

        {/* Error Banner */}
        {reuploadErrorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{reuploadErrorMessage}</span>
          </div>
        )}

        <div className="p-5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl space-y-4">
          {/* Current Document Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Berkas Terdaftar Saat Ini:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{currentSub.rabFileName}</span>
              <span className="text-[11px] text-slate-400 block">{currentSub.rabFileSize || "2.1 MB"} &bull; Format PDF</span>
            </div>
            <button
              type="button"
              onClick={() => onPreviewPdf(currentSub)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lihat Berkas Saat Ini</span>
            </button>
          </div>

          {/* Upload New File Area */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wide">Pilih Berkas PDF RAB Baru (Revisi):</label>
            <div className="border-2 border-dashed border-cyan-300 dark:border-cyan-800/60 rounded-xl p-5 text-center bg-cyan-50/30 dark:bg-cyan-950/20 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 transition-colors">
              <input type="file" id="reupload-file-input" accept=".pdf" onChange={handleFileChange} className="hidden" />
              <label htmlFor="reupload-file-input" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                <Upload className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">{reuploadFileName ? "Ganti Berkas PDF yang Dipilih" : "Klik di sini untuk memilih berkas PDF RAB revisi"}</span>
                <span className="text-[11px] text-slate-400">Format yang diterima: .pdf (maksimal 20 MB)</span>
              </label>

              {reuploadFileName && (
                <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Berkas Baru Siap: {reuploadFileName} ({reuploadFileSize})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Textarea Catatan Revisi Satker */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wide">Catatan Revisi / Uraian Perbaikan dari Satker:</label>
            <textarea
              id="reupload-notes-input"
              rows={3}
              value={reuploadNotes}
              onChange={(e) => setReuploadNotes(e.target.value)}
              placeholder="Tuliskan poin-poin yang telah diperbaiki sesuai catatan verifikator ROCAN di atas (contoh: Menyesuaikan besaran honor narasumber sesuai PMK SBM TA 2026, mengurangi volume jam kegiatan rapat, menyertakan tanda tangan PPK)..."
              className="w-full p-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal / Kembali
            </button>

            <button
              type="button"
              id="btn-submit-reupload"
              onClick={handleExecuteReupload}
              disabled={isReuploading || (!reuploadFile && !reuploadNotes.trim())}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-cyan-600/20 transition-all cursor-pointer ring-1 ring-cyan-500"
            >
              {isReuploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menganalisis Ulang Dokumen RAB dengan AI...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Reupload &amp; Ajukan Ulang Dokumen RAB</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
