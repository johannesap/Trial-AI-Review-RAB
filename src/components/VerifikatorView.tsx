import React, { useState, useEffect } from 'react';
import { UserAccount, SubmissionData, ChecklistCriterion } from '../types';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Printer,
  Eye,
  ShieldCheck,
  Award,
  Save,
  QrCode,
  Search,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { PdfPreviewModal } from './PdfPreviewModal';
import { PrintableReport } from './PrintableReport';

interface VerifikatorViewProps {
  currentUser: UserAccount;
  submissions: SubmissionData[];
  onUpdateSubmission: (updated: SubmissionData) => void;
}

export const VerifikatorView: React.FC<VerifikatorViewProps> = ({
  currentUser,
  submissions,
  onUpdateSubmission
}) => {
  const [selectedId, setSelectedId] = useState<string>(submissions[0]?.id || '');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const selectedSubmission = submissions.find(s => s.id === selectedId) || submissions[0];

  // Verifier Inputs for current selected item
  const [currentDecision, setCurrentDecision] = useState<'Diterima' | 'Ditolak' | 'Menunggu'>(
    selectedSubmission?.verificationStatus || 'Menunggu'
  );
  const [currentNotes, setCurrentNotes] = useState<string>(selectedSubmission?.verifikatorNotes || '');
  
  // Requirement 3: Row-by-row criteria state with Verifier Status and Verifier Notes
  const [editableCriteria, setEditableCriteria] = useState<ChecklistCriterion[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when selected submission changes
  useEffect(() => {
    if (selectedSubmission) {
      setCurrentDecision(selectedSubmission.verificationStatus);
      setCurrentNotes(selectedSubmission.verifikatorNotes || '');
      // Clone criteria results with fallback to defaults
      setEditableCriteria(
        selectedSubmission.criteriaResults.map(c => ({
          ...c,
          verifierStatus: c.verifierStatus || (c.status === 'passed' ? 'Lolos' : 'Ditolak'),
          verifierNotes: c.verifierNotes || ''
        }))
      );
      setSaveSuccess(false);
    }
  }, [selectedSubmission]);

  const handleSelectSubmission = (sub: SubmissionData) => {
    setSelectedId(sub.id);
  };

  // Requirement 3.3: Verifikator changes Lolos / Ditolak per row
  const handleRowStatusChange = (criterionId: number, newStatus: 'Lolos' | 'Ditolak') => {
    setEditableCriteria(prev =>
      prev.map(item =>
        item.id === criterionId ? { ...item, verifierStatus: newStatus } : item
      )
    );
  };

  // Requirement 3.3: Verifikator edits Catatan Evaluasi per row
  const handleRowNotesChange = (criterionId: number, notes: string) => {
    setEditableCriteria(prev =>
      prev.map(item =>
        item.id === criterionId ? { ...item, verifierNotes: notes } : item
      )
    );
  };

  // Quick reset row to AI recommendation
  const handleResetRowToAi = (criterionId: number) => {
    setEditableCriteria(prev =>
      prev.map(item =>
        item.id === criterionId
          ? {
              ...item,
              verifierStatus: item.status === 'passed' ? 'Lolos' : 'Ditolak',
              verifierNotes: ''
            }
          : item
      )
    );
  };

  // Save all decisions (both row-by-row and overall final decision)
  const handleSaveDecision = () => {
    if (!selectedSubmission) return;

    const updated: SubmissionData = {
      ...selectedSubmission,
      criteriaResults: editableCriteria,
      verificationStatus: currentDecision,
      verifikatorNotes: currentNotes,
      verifiedBy: currentUser.name,
      verifiedByNip: currentUser.id,
      verifiedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
      digitalSignatureHash: selectedSubmission.digitalSignatureHash || `DIGISIG-KOMDIGI-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    onUpdateSubmission(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchSearch =
      sub.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.satkerUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.program.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'menunggu' && sub.verificationStatus === 'Menunggu') ||
      (filterStatus === 'diterima' && sub.verificationStatus === 'Diterima') ||
      (filterStatus === 'ditolak' && sub.verificationStatus === 'Ditolak');

    return matchSearch && matchStatus;
  });

  // Calculate row-by-row verifier stats
  const totalRows = editableCriteria.length;
  const verifierPassedRows = editableCriteria.filter(c => c.verifierStatus === 'Lolos').length;
  const verifierRejectedRows = editableCriteria.filter(c => c.verifierStatus === 'Ditolak').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Portal Verifikator Anggaran Resmi</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Verifikasi &amp; Telaah Baris per Baris Dokumen RAB</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Periksa hasil telaah AI atas dokumen RAB, tentukan status kelayakan (Lolos/Ditolak) beserta catatan evaluasi pada setiap baris kriteria, dan tetapkan Berita Acara Keputusan Akhir berstempel digital.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-right">
            <span className="text-slate-400 block text-[10px]">Pejabat Verifikator:</span>
            <span className="font-semibold text-white block">{currentUser.name}</span>
            <span className="text-slate-400 text-[10px] font-mono">ID (8 Digit): {currentUser.id}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left List + Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submissions Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Antrean Berkas RAB ({submissions.length})
              </h3>
            </div>

            {/* Search and Filter */}
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search-submissions-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari Tiket, Satker, Kegiatan..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                id="filter-submissions-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="all">Semua Status</option>
                <option value="menunggu">Menunggu Putusan</option>
                <option value="diterima">Diterima</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Tidak ada berkas RAB yang sesuai filter.
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isSelected = sub.id === selectedSubmission?.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectSubmission(sub)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                          : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                          {sub.ticketNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.verificationStatus === 'Diterima'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : sub.verificationStatus === 'Ditolak'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {sub.verificationStatus}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {sub.satkerUserName}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {sub.kegiatan}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                        <span>Hasil AI: <strong>{sub.aiStatus}</strong> ({sub.aiScore}%)</span>
                        <span>{sub.submittedAt.split(' ')[0]}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Submission Details (8 cols) */}
        {selectedSubmission ? (
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Header & Metadata Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedSubmission.ticketNumber}
                    </span>
                    <span className="text-xs text-slate-400">&bull; Diajukan {selectedSubmission.submittedAt}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {selectedSubmission.program}
                  </h3>
                </div>

                {/* Preview PDF RAB */}
                <button
                  id="btn-preview-submission-pdf"
                  onClick={() => setPreviewOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>Lihat PDF RAB SatKer</span>
                </button>
              </div>

              {/* Metadata Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-4 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">SatKer Pengusul:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{selectedSubmission.satkerUserName}</span>
                  <span className="text-[11px] text-slate-500 block font-mono">ID: {selectedSubmission.satkerUserId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Unit Eselon &amp; Prioritas:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{selectedSubmission.unitEselon1}</span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 block font-semibold">{selectedSubmission.prioritas}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Kegiatan:</span>
                  <span className="font-medium">{selectedSubmission.kegiatan}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">KRO / RO:</span>
                  <span className="font-medium">{selectedSubmission.kro} / {selectedSubmission.ro}</span>
                </div>
              </div>
            </div>

            {/* REQUIREMENT 3.2:
                "Hasil Penelahaan Dokumen oleh AI berada diatas Formulir Keputusan Verifikator"
                REQUIREMENT 3.3:
                "Pada Hasil Penelahaan Dokumen dibuat agar disamping kolom Catatan Bukti 
                 ada kolom Verifikator yg bisa memilih Lolos dan Ditolak disetiap barisnya. 
                 Dan disamping kolom Verifikator ada kolom Catatan Evaluasi. 
                 Karena Verifikator akan memeriksa baris perbaris dan jika pada AI Lolos 
                 bisa diubah ke Ditolak maupun sebaliknya"
            */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Hasil Penelaahan Dokumen oleh AI &amp; Evaluasi Verifikator Baris per Baris
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Periksa setiap kriteria, ubah status Lolos/Ditolak pada kolom Verifikator bila diperlukan, dan beri catatan evaluasi.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    selectedSubmission.aiStatus === 'LOLOS'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    AI: {selectedSubmission.aiStatus} ({selectedSubmission.aiScore}%)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Verifikator: {verifierPassedRows} Lolos / {verifierRejectedRows} Ditolak
                  </span>
                </div>
              </div>

              {/* AI Summary Reasoning & Recommendation */}
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p><strong>Uraian Alasan AI:</strong> {selectedSubmission.aiReason}</p>
                <p><strong>Rekomendasi AI:</strong> {selectedSubmission.aiRecommendation}</p>
              </div>

              {/* 20 Criteria Table with Verifikator Columns:
                  1. No
                  2. Kriteria Wajib RAB
                  3. Status AI
                  4. Catatan Bukti AI
                  5. Kolom Verifikator (Lolos / Ditolak - can override AI!)
                  6. Kolom Catatan Evaluasi (Verifikator specific notes)
              */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px] sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-3 w-10 text-center">No</th>
                        <th className="px-3 py-3 min-w-[220px]">Kriteria Wajib RAB</th>
                        <th className="px-3 py-3 w-24 text-center">Status AI</th>
                        <th className="px-3 py-3 min-w-[180px]">Catatan Bukti AI</th>
                        <th className="px-3 py-3 min-w-[150px] text-center bg-blue-50/60 dark:bg-blue-950/40 border-l border-r border-blue-200 dark:border-blue-900">
                          Kolom Verifikator
                          <span className="block text-[9px] font-normal text-blue-600 dark:text-blue-400 lowercase">(bisa diubah)</span>
                        </th>
                        <th className="px-3 py-3 min-w-[200px] bg-slate-50/80 dark:bg-slate-950/60">
                          Catatan Evaluasi Verifikator
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {editableCriteria.map((c) => {
                        const isAiLolos = c.status === 'passed';
                        const isVerifLolos = c.verifierStatus === 'Lolos';
                        const isOverridden = (isAiLolos && !isVerifLolos) || (!isAiLolos && isVerifLolos);

                        return (
                          <tr 
                            key={c.id} 
                            className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                              isOverridden ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                            }`}
                          >
                            {/* No */}
                            <td className="px-3 py-3 text-center font-mono text-slate-400 font-bold">
                              {c.id}
                            </td>

                            {/* Kriteria */}
                            <td className="px-3 py-3">
                              <div className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                                {c.text}
                              </div>
                              {c.category && (
                                <span className="inline-block mt-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[9px] font-mono">
                                  {c.category}
                                </span>
                              )}
                            </td>

                            {/* Status AI */}
                            <td className="px-3 py-3 text-center">
                              {isAiLolos ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Lolos
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                  <XCircle className="w-3 h-3" />
                                  Ditolak
                                </span>
                              )}
                            </td>

                            {/* Catatan Bukti AI */}
                            <td className="px-3 py-3 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                              {c.notes}
                            </td>

                            {/* Requirement 3.3: Kolom Verifikator (bisa memilih Lolos dan Ditolak disetiap barisnya) */}
                            <td className="px-3 py-3 text-center bg-blue-50/30 dark:bg-blue-950/20 border-l border-r border-blue-100 dark:border-blue-900/60">
                              <div className="inline-flex p-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => handleRowStatusChange(c.id, 'Lolos')}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                                    isVerifLolos
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-emerald-600'
                                  }`}
                                  title="Tetapkan Lolos untuk baris kriteria ini"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Lolos</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRowStatusChange(c.id, 'Ditolak')}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                                    !isVerifLolos
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : 'text-slate-500 hover:text-rose-600'
                                  }`}
                                  title="Tetapkan Ditolak untuk baris kriteria ini"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Ditolak</span>
                                </button>
                              </div>

                              {isOverridden && (
                                <div className="text-[9px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                                  *Diubah dari AI
                                </div>
                              )}
                            </td>

                            {/* Requirement 3.3: Kolom Catatan Evaluasi per baris */}
                            <td className="px-3 py-3 bg-slate-50/40 dark:bg-slate-950/40">
                              <input
                                type="text"
                                value={c.verifierNotes}
                                onChange={(e) => handleRowNotesChange(c.id, e.target.value)}
                                placeholder="Catatan evaluasi baris..."
                                className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* REQUIREMENT 3.1:
                "Formulir Keputusan Verifikator diubah ke paling bawah"
            */}
            <div 
              id="formulir-keputusan-verifikator"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-5"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Formulir Keputusan Akhir Verifikator Anggaran
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tetapkan keputusan akhir berkas RAB secara komprehensif berdasarkan penelaahan 20 kriteria di atas.
                  </p>
                </div>
                {saveSuccess && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4" />
                    Keputusan &amp; Evaluasi Tersimpan!
                  </span>
                )}
              </div>

              {/* 2 Main Verifier Columns: Status & Keterangan */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl">
                {/* Kolom 1: Pilihan Diterima atau Ditolak (5 cols) */}
                <div className="md:col-span-5 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    Kolom 1: Keputusan Akhir <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Pilih status penetapan akhir dokumen usulan RAB:
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      id="btn-verif-diterima"
                      type="button"
                      onClick={() => setCurrentDecision('Diterima')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        currentDecision === 'Diterima'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 text-current" />
                      <span className="text-xs font-bold uppercase tracking-wider">Diterima</span>
                    </button>

                    <button
                      id="btn-verif-ditolak"
                      type="button"
                      onClick={() => setCurrentDecision('Ditolak')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        currentDecision === 'Ditolak'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                      }`}
                    >
                      <XCircle className="w-5 h-5 text-current" />
                      <span className="text-xs font-bold uppercase tracking-wider">Ditolak</span>
                    </button>
                  </div>

                  <div className="text-[11px] font-medium pt-1 text-slate-600 dark:text-slate-400">
                    Status terpilih: <strong className="font-bold text-slate-900 dark:text-white uppercase">{currentDecision}</strong>
                  </div>
                </div>

                {/* Kolom 2: Keterangan / Catatan Verifikator (7 cols) */}
                <div className="md:col-span-7 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    Kolom 2: Catatan / Keterangan Berita Acara <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Uraikan dasar pertimbangan penetapan atau arahan revisi bagi SatKer:
                  </p>
                  <textarea
                    id="textarea-verifikator-keterangan"
                    rows={4}
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                    placeholder="Contoh: Dokumen RAB telah disetujui penuh dengan pemenuhan 20 kriteria kepatuhan SBM. Disetujui untuk diteruskan ke proses pengesahan DIPA."
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Save Decision Button */}
              <div className="flex justify-end pt-1">
                <button
                  id="btn-save-verifikator-decision"
                  onClick={handleSaveDecision}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Keputusan &amp; Evaluasi Baris per Baris</span>
                </button>
              </div>
            </div>

            {/* Cetak PDF Laporan Akhir Berita Acara Digital */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-900/50 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <QrCode className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                      Tanda Tangan Digital Terverifikasi
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full font-mono font-bold">
                      BSrE Valid
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    Laporan Akhir Berita Acara Verifikasi Dokumen RAB
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Dokumen hasil pengesahan memuat evaluasi 20 kriteria baris per baris, QR Code verifikasi integritas, SHA-256 hash, serta NIP dan tanda tangan digital resmi.
                  </p>
                </div>
              </div>

              <button
                id="btn-cetak-laporan-akhir-verifikator"
                onClick={() => setIsPrintModalOpen(true)}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak PDF Laporan Akhir Digital</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Pilih berkas pada antrean sebelah kiri untuk memulai proses verifikasi.
          </div>
        )}
      </div>

      {/* PDF Preview Modal for RAB */}
      {selectedSubmission && (
        <PdfPreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          fileName={selectedSubmission.rabFileName}
          fileDataUrl={selectedSubmission.pdfDataUrl}
          title={`Dokumen Usulan RAB: ${selectedSubmission.ticketNumber}`}
          metadata={{
            program: selectedSubmission.program,
            kegiatan: selectedSubmission.kegiatan,
            kro: selectedSubmission.kro,
            ro: selectedSubmission.ro,
            unit: selectedSubmission.unitEselon1,
            satkerName: selectedSubmission.satkerUserName
          }}
        />
      )}

      {/* Printable Report Modal */}
      {selectedSubmission && (
        <PrintableReport
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          submission={selectedSubmission}
          reportType="verified-report"
        />
      )}
    </div>
  );
};
