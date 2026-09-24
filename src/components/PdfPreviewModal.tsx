import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, FileSpreadsheet, Download, ExternalLink, Printer } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileDataUrl?: string;
  title: string;
  metadata?: {
    program?: string;
    kegiatan?: string;
    kro?: string;
    ro?: string;
    unit?: string;
    satkerName?: string;
  };
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileDataUrl,
  title,
  metadata
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5 truncate">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold truncate">{title}</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate">{fileName}</p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 text-slate-300">
              <button
                onClick={() => setZoomLevel(prev => Math.max(60, prev - 15))}
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Perkecil Tampilan"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(160, prev + 15))}
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Perbesar Tampilan"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
              title="Putar Dokumen 90 Derajat"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-slate-800/80 hover:bg-rose-600/80 text-slate-400 hover:text-white rounded-xl transition-colors ml-2"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewer Content Area */}
        <div className="flex-1 bg-slate-950 p-6 overflow-auto flex justify-center items-start">
          {fileDataUrl ? (
            <div
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out'
              }}
              className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden min-h-[840px]"
            >
              <iframe
                src={fileDataUrl}
                title={fileName}
                className="w-full h-[840px] border-none"
              />
            </div>
          ) : (
            /* High-Fidelity Simulated Official RAB PDF Document */
            <div
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out'
              }}
              className="w-full max-w-3xl bg-white text-slate-900 rounded-xl shadow-2xl p-10 font-serif border border-slate-300 min-h-[880px] space-y-6"
            >
              {/* Header Letterhead */}
              <div className="border-b-2 border-slate-900 pb-3 text-center">
                <div className="text-[10px] uppercase font-sans font-bold text-slate-600 tracking-wider">
                  Kementerian Komunikasi dan Digital Republik Indonesia
                </div>
                <div className="text-sm font-bold uppercase tracking-tight text-slate-900 mt-0.5">
                  Rincian Anggaran Biaya (RAB) Tahun Anggaran 2026
                </div>
                <div className="text-[10px] font-sans text-slate-500">
                  Dokumen Pendukung Usulan Rencana Kerja dan Anggaran (RKA-K/L)
                </div>
              </div>

              {/* Metadata Info */}
              <div className="grid grid-cols-2 gap-3 text-xs font-sans bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Nomenklatur Program:</span>
                  <span className="font-semibold text-slate-900">{metadata?.program || '059.01.GG Program Dukungan Manajemen'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Kegiatan:</span>
                  <span className="font-semibold text-slate-900">{metadata?.kegiatan || '2133 Layanan Manajemen Kinerja'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Klasifikasi Output (KRO / RO):</span>
                  <span className="font-semibold text-slate-900">{metadata?.kro || '2133.EBA'} &bull; {metadata?.ro || '2133.EBA.994'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Unit Eselon I / Satker:</span>
                  <span className="font-semibold text-slate-900">{metadata?.unit || 'Direktorat Jenderal Komunikasi Publik'}</span>
                </div>
              </div>

              {/* RAB Items Table with Standard Account Codes (BAS) */}
              <div className="space-y-2 font-sans text-xs">
                <div className="font-bold text-slate-800 uppercase text-[11px] tracking-wide">
                  Tabel Rincian Komponen Anggaran &amp; Bagan Akun Standar (BAS):
                </div>

                <table className="w-full text-left border border-slate-300 border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300">Kode Akun</th>
                      <th className="p-2 border-r border-slate-300">Uraian Komponen Belanja</th>
                      <th className="p-2 border-r border-slate-300 text-center">Vol</th>
                      <th className="p-2 border-r border-slate-300 text-center">Satuan</th>
                      <th className="p-2 border-r border-slate-300 text-right">Harga Satuan (Rp)</th>
                      <th className="p-2 text-right">Jumlah Total (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-mono font-semibold border-r border-slate-300">521211</td>
                      <td className="p-2 border-r border-slate-300">Belanja Bahan &amp; ATK Penyelenggaraan</td>
                      <td className="p-2 text-center border-r border-slate-300">12</td>
                      <td className="p-2 text-center border-r border-slate-300">Paket</td>
                      <td className="p-2 text-right font-mono border-r border-slate-300">1.850.000</td>
                      <td className="p-2 text-right font-mono font-bold">22.200.000</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-mono font-semibold border-r border-slate-300">521219</td>
                      <td className="p-2 border-r border-slate-300">Belanja Konsumsi Rapat Koordinasi (SBM)</td>
                      <td className="p-2 text-center border-r border-slate-300">150</td>
                      <td className="p-2 text-center border-r border-slate-300">Orang/Kali</td>
                      <td className="p-2 text-right font-mono border-r border-slate-300">53.000</td>
                      <td className="p-2 text-right font-mono font-bold">7.950.000</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-mono font-semibold border-r border-slate-300">522151</td>
                      <td className="p-2 border-r border-slate-300">Honorarium Narasumber Pakar Komunikasi</td>
                      <td className="p-2 text-center border-r border-slate-300">10</td>
                      <td className="p-2 text-center border-r border-slate-300">Jam/Pelajaran</td>
                      <td className="p-2 text-right font-mono border-r border-slate-300">1.000.000</td>
                      <td className="p-2 text-right font-mono font-bold">10.000.000</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-mono font-semibold border-r border-slate-300">524111</td>
                      <td className="p-2 border-r border-slate-300">Belanja Perjalanan Dinas Monitoring Lapangan</td>
                      <td className="p-2 text-center border-r border-slate-300">4</td>
                      <td className="p-2 text-center border-r border-slate-300">Orang/Paket</td>
                      <td className="p-2 text-right font-mono border-r border-slate-300">4.200.000</td>
                      <td className="p-2 text-right font-mono font-bold">16.800.000</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold border-t border-slate-300">
                      <td colSpan={5} className="p-2 text-right border-r border-slate-300">
                        Total Alokasi Rincian Anggaran Biaya (RAB):
                      </td>
                      <td className="p-2 text-right font-mono text-blue-700 text-xs">
                        Rp 56.950.000
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature area */}
              <div className="pt-8 grid grid-cols-2 text-center text-xs font-sans">
                <div className="space-y-12">
                  <p className="text-slate-500">Penyusun Rincian Biaya,</p>
                  <div>
                    <p className="font-bold underline">Staf Pengelola Keuangan</p>
                    <p className="text-slate-500 font-mono text-[10px]">Unit Kerja Perencana</p>
                  </div>
                </div>
                <div className="space-y-12">
                  <p className="text-slate-500">Disetujui Oleh,</p>
                  <div>
                    <p className="font-bold underline">{metadata?.satkerName || 'Pejabat Pembuat Komitmen (PPK)'}</p>
                    <p className="text-slate-500 font-mono text-[10px]">NIP. 19890422</p>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 font-sans text-center pt-6 border-t border-slate-100">
                Dokumen resmi hasil generate preview PDF sistem verifikasi anggaran Kementerian Komunikasi dan Digital RI
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
