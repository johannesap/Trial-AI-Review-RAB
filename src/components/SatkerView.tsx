import React, { useState, useEffect } from 'react';
import { UserAccount, SubmissionData } from '../types';
import {
  getUniquePrograms,
  getKegiatansForProgram,
  getKrosForKegiatan,
  getRosForKro,
  HIERARCHY_DATA
} from '../data/budgetData';
import { runAiRabAnalysis } from '../data/defaultCriteria';
import {
  FileSpreadsheet,
  Upload,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Printer,
  ChevronDown,
  Layers,
  Loader2,
  Check,
  FileCheck
} from 'lucide-react';
import { PdfPreviewModal } from './PdfPreviewModal';
import { PrintableReport } from './PrintableReport';

interface SatkerViewProps {
  currentUser: UserAccount;
  onAddSubmission: (submission: SubmissionData) => void;
  submissions: SubmissionData[];
}

export const SatkerView: React.FC<SatkerViewProps> = ({
  currentUser,
  onAddSubmission,
  submissions
}) => {
  // Cascading Dropdown States
  const [programs, setPrograms] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');

  const [kegiatans, setKegiatans] = useState<{ kegiatan: string; unitEselon1: string }[]>([]);
  const [selectedKegiatan, setSelectedKegiatan] = useState<string>('');

  const [kros, setKros] = useState<{ kro: string; unitEselon2: string; prioritas: string }[]>([]);
  const [selectedKro, setSelectedKro] = useState<string>('');

  const [ros, setRos] = useState<string[]>([]);
  const [selectedRo, setSelectedRo] = useState<string>('');

  // Info details from hierarchy
  const [currentUnitEselon1, setCurrentUnitEselon1] = useState<string>('');
  const [currentUnitEselon2, setCurrentUnitEselon2] = useState<string>('');
  const [currentPrioritas, setCurrentPrioritas] = useState<string>('');

  // File Upload State: RAB ONLY (Requirement 2)
  const [rabFile, setRabFile] = useState<File | null>(null);
  const [rabFileName, setRabFileName] = useState<string>('RAB_Rincian_Biaya_2026.pdf');
  const [rabDataUrl, setRabDataUrl] = useState<string | undefined>(undefined);

  // Preview Modal States
  const [previewOpen, setPreviewOpen] = useState(false);

  // AI Loading & Result States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressText, setAnalysisProgressText] = useState('');
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionData | null>(null);

  // Printable Report Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Init Programs
  useEffect(() => {
    const list = getUniquePrograms();
    setPrograms(list);
    if (list.length > 0) {
      setSelectedProgram(list[0]);
    }
  }, []);

  // When Program changes, update Kegiatans
  useEffect(() => {
    if (!selectedProgram) {
      setKegiatans([]);
      setSelectedKegiatan('');
      return;
    }
    const kList = getKegiatansForProgram(selectedProgram);
    setKegiatans(kList);
    if (kList.length > 0) {
      setSelectedKegiatan(kList[0].kegiatan);
      setCurrentUnitEselon1(kList[0].unitEselon1);
    } else {
      setSelectedKegiatan('');
      setCurrentUnitEselon1('');
    }
  }, [selectedProgram]);

  // When Kegiatan changes, update KROs
  useEffect(() => {
    if (!selectedProgram || !selectedKegiatan) {
      setKros([]);
      setSelectedKro('');
      return;
    }
    const kroList = getKrosForKegiatan(selectedProgram, selectedKegiatan);
    setKros(kroList);
    if (kroList.length > 0) {
      setSelectedKro(kroList[0].kro);
      setCurrentUnitEselon2(kroList[0].unitEselon2);
      setCurrentPrioritas(kroList[0].prioritas);
    } else {
      setSelectedKro('');
      setCurrentUnitEselon2('');
      setCurrentPrioritas('');
    }
  }, [selectedProgram, selectedKegiatan]);

  // When KRO changes, update ROs
  useEffect(() => {
    if (!selectedProgram || !selectedKegiatan || !selectedKro) {
      setRos([]);
      setSelectedRo('');
      return;
    }
    const roList = getRosForKro(selectedProgram, selectedKegiatan, selectedKro);
    setRos(roList);
    if (roList.length > 0) {
      setSelectedRo(roList[0]);
    } else {
      setSelectedRo('');
    }

    // Update prioritas & unit eselon 2 if available
    const match = HIERARCHY_DATA.find(
      h => h.program === selectedProgram && h.kegiatan === selectedKegiatan && h.kro === selectedKro
    );
    if (match) {
      setCurrentUnitEselon2(match.unitEselon2);
      setCurrentPrioritas(match.prioritasCheck);
    }
  }, [selectedProgram, selectedKegiatan, selectedKro]);

  // Handle RAB file upload
  const handleRabUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRabFile(file);
      setRabFileName(file.name);
      const url = URL.createObjectURL(file);
      setRabDataUrl(url);
    }
  };

  // Requirement: "tombol hapus"
  const handleResetForm = () => {
    if (programs.length > 0) setSelectedProgram(programs[0]);
    setRabFile(null);
    setRabFileName('RAB_Rincian_Biaya_2026.pdf');
    setRabDataUrl(undefined);
    setCurrentSubmission(null);
  };

  // Requirement: Submit RAB to AI Engine
  const handleAiSubmit = () => {
    setIsAnalyzing(true);
    setAnalysisProgressText('Mengunggah dokumen PDF RAB ke AI Engine...');

    setTimeout(() => {
      setAnalysisProgressText('Mengekstraksi Bagan Akun Standar (BAS) & Komponen Biaya...');
    }, 700);

    setTimeout(() => {
      setAnalysisProgressText('Memverifikasi 20 Kriteria Wajib Dokumen RAB & Kepatuhan SBM...');
    }, 1500);

    setTimeout(() => {
      setAnalysisProgressText('Memeriksa kalkulasi matematis volume x harga dan perpajakan...');
    }, 2200);

    setTimeout(() => {
      const analysis = runAiRabAnalysis(
        selectedProgram,
        selectedKegiatan,
        selectedKro,
        selectedRo,
        rabFileName
      );

      const newSubmission: SubmissionData = {
        id: `SUB-${Date.now()}`,
        ticketNumber: `RAB/KOMDIGI/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        satkerUserId: currentUser.id,
        satkerUserName: currentUser.name,
        satkerUnit: currentUser.unit,
        submittedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
        program: selectedProgram,
        kegiatan: selectedKegiatan,
        kro: selectedKro,
        ro: selectedRo,
        unitEselon1: currentUnitEselon1 || 'Direktorat Jenderal Komunikasi Publik dan Media',
        unitEselon2: currentUnitEselon2 || 'Direktorat Informasi Publik',
        prioritas: currentPrioritas || 'Prioritas Nasional',
        rabFileName: rabFileName,
        rabFileSize: rabFile ? `${(rabFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB',
        pdfDataUrl: rabDataUrl,
        aiStatus: analysis.aiStatus,
        aiScore: analysis.aiScore,
        aiReason: analysis.aiReason,
        aiRecommendation: analysis.aiRecommendation,
        criteriaResults: analysis.criteriaResults,
        verificationStatus: 'Menunggu',
        verifikatorNotes: ''
      };

      setCurrentSubmission(newSubmission);
      onAddSubmission(newSubmission);
      setIsAnalyzing(false);
    }, 2900);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              <Layers className="w-4 h-4" />
              <span>Portal Satuan Kerja (SatKer) Pengusul</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Pengajuan Telaah Dokumen RAB Mandiri</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Pilih hierarki anggaran RKA-K/L (Program, Kegiatan, KRO, RO) dari basis data referensi, unggah berkas PDF Rincian Anggaran Biaya (RAB), lakukan pratinjau dokumen, dan jalankan penapisan otomatis AI.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-right">
            <span className="text-slate-400 block text-[10px]">Satker Pengusul:</span>
            <span className="font-semibold text-white block">{currentUser.name}</span>
            <span className="text-slate-400 text-[10px] font-mono">ID (8 Digit): {currentUser.id}</span>
          </div>
        </div>
      </div>

      {/* Main Input Card: Cascading Dropdowns + RAB PDF Upload */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            1. Form Pengisian Hierarki Anggaran (Dari Data Excel / CSV)
          </h3>
          <span className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium">
            Cascading Dropdown Otomatis
          </span>
        </div>

        {/* 4 Cascading Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* a. Program */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              a. Program <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="select-program"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none pr-8 font-medium"
              >
                {programs.map((prog) => (
                  <option key={prog} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* b. Kegiatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              b. Kegiatan (Menyesuaikan Program Terpilih) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="select-kegiatan"
                value={selectedKegiatan}
                onChange={(e) => setSelectedKegiatan(e.target.value)}
                disabled={kegiatans.length === 0}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none pr-8 font-medium disabled:opacity-50"
              >
                {kegiatans.map((item) => (
                  <option key={item.kegiatan} value={item.kegiatan}>
                    {item.kegiatan}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* c. KRO */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              c. Klasifikasi Rincian Output (KRO) (Menyesuaikan Kegiatan) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="select-kro"
                value={selectedKro}
                onChange={(e) => setSelectedKro(e.target.value)}
                disabled={kros.length === 0}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none pr-8 font-medium disabled:opacity-50"
              >
                {kros.map((item) => (
                  <option key={item.kro} value={item.kro}>
                    {item.kro}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* d. RO */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              d. Rincian Output (RO) (Menyesuaikan KRO) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="select-ro"
                value={selectedRo}
                onChange={(e) => setSelectedRo(e.target.value)}
                disabled={ros.length === 0}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none pr-8 font-medium disabled:opacity-50"
              >
                {ros.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Info Box: Automatically inferred from CSV hierarchy */}
        {(currentUnitEselon1 || currentUnitEselon2 || currentPrioritas) && (
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold uppercase block">Unit Eselon I:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">{currentUnitEselon1 || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold uppercase block">Unit Eselon II:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">{currentUnitEselon2 || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold uppercase block">Kategori Prioritas:</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold mt-0.5 ${
                currentPrioritas === 'Prioritas Nasional'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {currentPrioritas || 'Bukan Prioritas Nasional'}
              </span>
            </div>
          </div>
        )}

        {/* Section 2: PDF Upload & Preview Modal Trigger: RAB ONLY (Requirement 2) */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              2. Kolom Input File Dokumen PDF RAB (Rincian Anggaran Biaya)
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Format berkas: .pdf</span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/70 dark:bg-slate-950/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full md:w-auto">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {rabFileName}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] rounded font-mono font-semibold">
                    RAB PDF
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Memuat struktur Bagan Akun Standar (BAS), rincian komponen biaya, volume, harga satuan SBM, dan pengesahan PPK.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <label 
                htmlFor="rab-file-upload-input"
                className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
              >
                Pilih Berkas PDF
              </label>
              <input
                id="rab-file-upload-input"
                type="file"
                accept=".pdf"
                onChange={handleRabUpload}
                className="hidden"
              />

              {/* Requirement: "Ketika input ada tombol pop up untuk preview pdf yg telah diupload" */}
              <button
                id="btn-preview-rab-popup"
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                title="Pop-up Pratinjau Dokumen RAB PDF"
              >
                <Eye className="w-4 h-4" />
                <span>Preview PDF RAB</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: Submit & Hapus (Requirement) */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            id="btn-satker-reset"
            type="button"
            onClick={handleResetForm}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Hapus / Reset Formulir</span>
          </button>

          <button
            id="btn-satker-submit"
            type="button"
            disabled={isAnalyzing}
            onClick={handleAiSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2.5 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-60"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{analysisProgressText || 'Memproses Pengecekan AI...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Submit &amp; Periksa RAB dengan AI (LLM)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Loading Progress Banner */}
      {isAnalyzing && (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="inline-flex p-4 rounded-full bg-blue-500/10 text-blue-400 mb-2">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Engine AI LLM Sedang Menelaah Dokumen RAB
          </h3>
          <p className="text-xs text-blue-300 font-mono animate-pulse">
            {analysisProgressText}
          </p>
          <div className="max-w-md mx-auto bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-3/4 animate-pulse rounded-full" />
          </div>
          <p className="text-[11px] text-slate-400">
            Pengecekan mencakup 20 Kriteria Wajib Dokumen Rincian Anggaran Biaya (RAB) Sesuai Standar Biaya Masukan (SBM) PMK &amp; RKA-K/L.
          </p>
        </div>
      )}

      {/* Requirement: "Ketika telah disubmit maka akan muncul hasilnya pengecekannya dibawah, jika belum submit maka tidak muncul hasilnya sesuai dengan isian PDF 'hasil AI.pdf'" */}
      {currentSubmission && !isAnalyzing && (
        <div 
          id="ai-results-section"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-fadeIn"
        >
          {/* Header of Results */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded uppercase">
                  Hasil Penelaahan AI (LLM)
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Tiket: {currentSubmission.ticketNumber}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Laporan Hasil Pengecekan Dokumen RAB "hasil AI.pdf"
              </h3>
            </div>

            {/* Requirement: "diakhir ada fitur cetak pdf" */}
            <button
              id="btn-cetak-pdf-satker"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Hasil AI (PDF)</span>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Card & Overview Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Badge */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                currentSubmission.aiStatus === 'LOLOS'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 block">Status Kelayakan AI</span>
                  <div className="text-2xl font-black mt-1 flex items-center gap-2">
                    {currentSubmission.aiStatus === 'LOLOS' ? (
                      <>
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                        <span>LOLOS</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                        <span>TIDAK LOLOS</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-xs opacity-90">
                  Tingkat Kepatuhan: <strong className="font-mono">{currentSubmission.aiScore}%</strong> (20 Kriteria Wajib RAB)
                </div>
              </div>

              {/* Alasan */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl col-span-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block uppercase mb-1">
                  Alasan &amp; Dasar Penilaian AI (RAB):
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentSubmission.aiReason}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block uppercase mb-1">
                    Rekomendasi Perbaikan Dokumen:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {currentSubmission.aiRecommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist Table (Exact 20 RAB Criteria) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Daftar Pengecekan 20 Kriteria Wajib RAB:
                </h4>
                <span className="text-[11px] text-slate-500">
                  {currentSubmission.criteriaResults.filter(c => c.status === 'passed').length} dari 20 Kriteria Terpenuhi
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">No</th>
                      <th className="px-4 py-3">Teks Kriteria Wajib Dokumen RAB</th>
                      <th className="px-4 py-3 w-28 text-center">Status AI</th>
                      <th className="px-4 py-3">Keterangan / Bukti Temuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {currentSubmission.criteriaResults.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-center font-mono text-slate-500">{c.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                          <div>{c.text}</div>
                          {c.category && (
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{c.category}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {c.status === 'passed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Lolos
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                              <XCircle className="w-3.5 h-3.5" />
                              Tidak
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-[11px]">{c.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notification */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-indigo-900 dark:text-indigo-200">
                <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  Dokumen RAB berhasil diajukan ke antrean <strong>Verifikator Anggaran</strong> untuk telaah baris per baris.
                </span>
              </div>
              <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-mono">Status: Menunggu Verifikasi</span>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal for RAB */}
      <PdfPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileName={rabFileName}
        fileDataUrl={rabDataUrl}
        title="Pratinjau Dokumen RAB (Rincian Anggaran Biaya)"
        metadata={{
          program: selectedProgram,
          kegiatan: selectedKegiatan,
          kro: selectedKro,
          ro: selectedRo,
          unit: currentUnitEselon1,
          satkerName: currentUser.name
        }}
      />

      {/* Printable Report Modal */}
      {currentSubmission && (
        <PrintableReport
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          submission={currentSubmission}
          reportType="ai-result"
        />
      )}
    </div>
  );
};
