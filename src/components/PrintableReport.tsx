import React from 'react';
import { SubmissionData } from '../types';
import { Printer, X, ShieldCheck, CheckCircle2, XCircle, QrCode } from 'lucide-react';

interface PrintableReportProps {
  isOpen: boolean;
  onClose: () => void;
  submission: SubmissionData;
  reportType: 'ai-result' | 'verified-report';
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  isOpen,
  onClose,
  submission,
  reportType
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isVerified = reportType === 'verified-report';
  const passedCriteriaCount = submission.criteriaResults.filter(c => c.status === 'passed').length;
  const verifierPassedCount = submission.criteriaResults.filter(c => c.verifierStatus === 'Lolos').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full my-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold">
              {isVerified ? 'Pratinjau Cetak Berita Acara Verifikasi Akhir RAB' : 'Pratinjau Cetak Hasil Penelaahan AI Dokumen RAB'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan ke PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 Style) */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 font-serif text-slate-900 print:p-0 print:overflow-visible">
          {/* Official Letterhead (KOP SURAT) */}
          <div className="border-b-4 border-double border-slate-900 pb-4 text-center">
            <div className="text-xs uppercase tracking-widest font-sans font-semibold text-slate-600">
              Kementerian Komunikasi dan Digital Republik Indonesia
            </div>
            <div className="text-base sm:text-lg font-bold uppercase tracking-tight text-slate-900 mt-0.5">
              Inspektorat Jenderal &bull; Biro Perencanaan dan Keuangan
            </div>
            <div className="text-[11px] font-sans text-slate-500 mt-1">
              Jalan Medan Merdeka Barat No. 9, Jakarta Pusat 10110 &bull; Telp (021) 3456789 &bull; Laman: komdigi.go.id
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide underline underline-offset-4">
              {isVerified
                ? 'BERITA ACARA VERIFIKASI AKHIR DOKUMEN RINCIAN ANGGARAN BIAYA (RAB)'
                : 'LEMBAR HASIL PENELAAHAN OTOMATIS BERKAS RAB BERBASIS ARTIFICIAL INTELLIGENCE'}
            </h2>
            <div className="text-xs font-sans font-mono text-slate-600 mt-1">
              Nomor Registrasi Tiket: {submission.ticketNumber}
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-4 text-xs font-sans mb-6">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 w-44 font-semibold text-slate-700">Tanggal Pengajuan</td>
                  <td className="py-1.5 text-slate-900">: {submission.submittedAt}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-700">Satuan Kerja Pengusul</td>
                  <td className="py-1.5 text-slate-900">: {submission.satkerUserName} (ID: {submission.satkerUserId})</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-700">Unit Eselon I / II</td>
                  <td className="py-1.5 text-slate-900">: {submission.unitEselon1} / {submission.unitEselon2}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-700">Nomenklatur Program</td>
                  <td className="py-1.5 text-slate-900">: {submission.program}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-700">Kegiatan</td>
                  <td className="py-1.5 text-slate-900">: {submission.kegiatan}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-700">KRO / RO</td>
                  <td className="py-1.5 text-slate-900">: {submission.kro} / {submission.ro}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-700">Prioritas Anggaran</td>
                  <td className="py-1.5 text-slate-900">: {submission.prioritas}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-1.5 font-semibold text-slate-700">Dokumen Berkas RAB</td>
                  <td className="py-1.5 text-slate-900">: {submission.rabFileName} ({submission.rabFileSize})</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* AI Result Summary Box */}
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 font-sans text-xs space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wide">
                Status Kelayakan AI:
              </span>
              <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                submission.aiStatus === 'LOLOS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {submission.aiStatus} ({submission.aiScore}% Kepatuhan)
              </span>
            </div>
            <div>
              <strong className="text-slate-800">Alasan &amp; Penilaian AI:</strong>
              <p className="text-slate-700 mt-0.5">{submission.aiReason}</p>
            </div>
            <div>
              <strong className="text-slate-800">Rekomendasi Tindak Lanjut:</strong>
              <p className="text-slate-700 mt-0.5 whitespace-pre-line">{submission.aiRecommendation}</p>
            </div>
          </div>

          {/* 20 Criteria Table with AI & Verifier evaluation */}
          <div className="mb-6 font-sans">
            <h4 className="text-xs font-bold uppercase text-slate-800 mb-2">
              Daftar Evaluasi 20 Kriteria Wajib Dokumen RAB:
            </h4>
            <table className="w-full text-left text-[11px] border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 w-8 text-center border-r border-slate-300">No</th>
                  <th className="p-2 border-r border-slate-300">Kriteria Wajib Kelayakan RAB</th>
                  <th className="p-2 w-20 text-center border-r border-slate-300">Status AI</th>
                  {isVerified && (
                    <>
                      <th className="p-2 w-24 text-center border-r border-slate-300 bg-emerald-50">Verifikator</th>
                      <th className="p-2 bg-slate-50">Catatan Evaluasi Verifikator</th>
                    </>
                  )}
                  {!isVerified && (
                    <th className="p-2">Keterangan / Temuan Bukti</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {submission.criteriaResults.map((c) => (
                  <tr key={c.id} className="border-b border-slate-200">
                    <td className="p-2 text-center font-mono border-r border-slate-300 text-slate-600">{c.id}</td>
                    <td className="p-2 font-medium text-slate-900 border-r border-slate-300">{c.text}</td>
                    <td className="p-2 text-center font-bold border-r border-slate-300">
                      <span className={c.status === 'passed' ? 'text-emerald-700' : 'text-rose-700'}>
                        {c.status === 'passed' ? 'LOLOS' : 'TIDAK'}
                      </span>
                    </td>
                    {isVerified && (
                      <>
                        <td className="p-2 text-center font-bold border-r border-slate-300 bg-emerald-50/50">
                          <span className={c.verifierStatus === 'Lolos' ? 'text-emerald-700' : 'text-rose-700'}>
                            {c.verifierStatus || (c.status === 'passed' ? 'Lolos' : 'Ditolak')}
                          </span>
                        </td>
                        <td className="p-2 text-slate-700 text-[10px] bg-slate-50/50">
                          {c.verifierNotes || c.notes}
                        </td>
                      </>
                    )}
                    {!isVerified && (
                      <td className="p-2 text-slate-600 text-[10px]">{c.notes}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Verification Decision Box if Verified */}
          {isVerified && (
            <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 font-sans text-xs space-y-2 mb-8">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 uppercase tracking-wide">
                  Keputusan Akhir Pejabat Verifikator:
                </span>
                <span className={`px-3 py-1 rounded font-bold text-xs uppercase ${
                  submission.verificationStatus === 'Diterima' ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {submission.verificationStatus}
                </span>
              </div>
              <p className="text-slate-800">
                <strong>Catatan / Keterangan Berita Acara:</strong> {submission.verifikatorNotes || 'Disetujui sesuai kriteria SBM 2026.'}
              </p>
            </div>
          )}

          {/* Signatures & Verified BSrE Digital Seal */}
          <div className="mt-8 pt-4 grid grid-cols-2 gap-8 font-sans text-xs">
            {/* Left: Satker */}
            <div className="text-center space-y-16">
              <div>
                <p className="text-slate-500">Mengetahui &amp; Mengajukan,</p>
                <p className="font-bold text-slate-900 mt-0.5">Pejabat Pembuat Komitmen (PPK)</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 underline">{submission.satkerUserName}</p>
                <p className="text-slate-600 font-mono text-[11px]">NIP. {submission.satkerUserId}</p>
              </div>
            </div>

            {/* Right: Verifikator + Digital Signature Seal */}
            <div className="text-center space-y-3">
              <div>
                <p className="text-slate-500">Jakarta, {submission.verifiedAt ? submission.verifiedAt.split(' ')[0] : '22 September 2026'}</p>
                <p className="font-bold text-slate-900 mt-0.5">Pejabat Verifikator Anggaran</p>
              </div>

              {/* Digital Seal */}
              <div className="inline-flex items-center justify-center p-2.5 border border-emerald-600 rounded-xl bg-emerald-50/50 text-emerald-900 gap-3 my-1">
                <QrCode className="w-10 h-10 text-emerald-700 shrink-0" />
                <div className="text-left text-[9px] font-mono leading-tight">
                  <div className="font-bold text-emerald-800">SERTIFIKAT ELEKTRONIK TERVERIFIKASI</div>
                  <div>Integritas: {submission.digitalSignatureHash || 'DIGISIG-KOMDIGI-8A4F9C21'}</div>
                  <div>Balai Sertifikasi Elektronik (BSrE) BSSN</div>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-900 underline">{submission.verifiedBy || 'Ahmad Fauzi, S.E., Ak., CA'}</p>
                <p className="text-slate-600 font-mono text-[11px]">NIP. {submission.verifiedByNip || '19910718'}</p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-12 pt-3 border-t border-slate-200 text-[10px] font-sans text-slate-400 text-center">
            Dokumen ini dicetak secara otomatis dari Sistem Pengecekan Dokumen RAB Berbasis AI &bull; Kementerian Komunikasi dan Digital RI
          </div>
        </div>
      </div>
    </div>
  );
};
