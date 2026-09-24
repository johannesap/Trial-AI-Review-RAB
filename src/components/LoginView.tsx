import React, { useState } from 'react';
import { UserAccount } from '../types';
import { INITIAL_USERS } from '../data/initialUsers';
import {
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface LoginViewProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onOpenPromptModal: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  onLoginSuccess,
  onOpenPromptModal
}) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Requirement: "Input ID dengan character 8"
    const trimmedId = userId.trim();

    if (trimmedId.length !== 8) {
      // Requirement: "Jika salah input ada notifikasi: 'user ID tidak ditemukan'"
      setErrorMessage('user ID tidak ditemukan');
      return;
    }

    // Find user by ID (check users state, with fallback to initialUsers)
    const foundUser = users.find(u => u.id === trimmedId) || INITIAL_USERS.find(u => u.id === trimmedId);

    // Requirement: "Jika salah input ada notifikasi: 'user ID tidak ditemukan'"
    if (!foundUser) {
      setErrorMessage('user ID tidak ditemukan');
      return;
    }

    // Password validation
    if (foundUser.password !== password) {
      setErrorMessage('Password yang Anda masukkan salah.');
      return;
    }

    if (!foundUser.isActive) {
      setErrorMessage('Akun ini sedang dinonaktifkan oleh Administrator.');
      return;
    }

    onLoginSuccess(foundUser);
  };

  // Demo account quick filler and instant login
  const handleQuickLogin = (id: string, pass: string) => {
    setUserId(id);
    setPassword(pass);
    setErrorMessage('');

    // Instant login on quick demo click
    const targetUser = users.find(u => u.id === id) || INITIAL_USERS.find(u => u.id === id);
    if (targetUser) {
      if (!targetUser.isActive) {
        setErrorMessage('Akun ini sedang dinonaktifkan oleh Administrator.');
        return;
      }
      onLoginSuccess(targetUser);
    } else {
      setErrorMessage('user ID tidak ditemukan');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Prompt Trigger */}
      <div className="absolute top-6 right-6">
        <button
          id="btn-open-prompt-modal-login"
          type="button"
          onClick={onOpenPromptModal}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 rounded-xl text-xs font-medium flex items-center gap-2 transition-all shadow-md shadow-amber-500/5 hover:border-amber-500/30"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Lihat Master Prompt AI Studio &amp; Backend Python (PostgreSQL)</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* App Logo & Title */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 border border-white/10">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-black text-white tracking-tight">
          Sistem Pengecekan File RAB AI
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 max-w-sm mx-auto">
          Portal Verifikasi &amp; Telaah Otomatis Rincian Anggaran Biaya (RAB) Berbasis LLM &bull; Kementerian Komunikasi dan Digital RI
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl backdrop-blur-xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Requirement: "Jika salah input ada notifikasi: 'user ID tidak ditemukan'" */}
            {errorMessage && (
              <div 
                id="login-error-message"
                className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-xs font-semibold animate-shake"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Requirement: "Input ID dengan character 8" */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label 
                  htmlFor="user-id-input"
                  className="block text-xs font-semibold text-slate-300"
                >
                  ID Pengguna / NIP
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {userId.length}/8 Karakter
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="user-id-input"
                  type="text"
                  maxLength={8}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.replace(/\s+/g, ''))}
                  placeholder="Contoh: 19890422 (8 digit)"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono tracking-wider"
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Wajib tepat 8 karakter (NIP / ID Akun).
              </p>
            </div>

            {/* Input Password */}
            <div>
              <label 
                htmlFor="password-input"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password akun Anda"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Requirement: "dibawahnya ada keterangan 'Lupa Password? Hubungi Admin'" */}
            <div className="text-center pt-1">
              <button
                id="btn-lupa-password"
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Lupa Password? Hubungi Admin</span>
              </button>
            </div>

            {/* Requirement: "Tombol Submit" */}
            <button
              id="btn-login-submit"
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Masuk ke Sistem</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Selector for 3 Roles (8-character ID) */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Akses Cepat Demo Akun (Klik untuk Langsung Masuk):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('19850115', 'password123')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-[11px] text-slate-300 transition-colors"
              >
                <div className="font-bold text-blue-400">1. Super Admin</div>
                <div className="font-mono text-[10px] text-slate-400">ID: 19850115</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('19890422', 'password123')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-[11px] text-slate-300 transition-colors"
              >
                <div className="font-bold text-indigo-400">2. SatKer</div>
                <div className="font-mono text-[10px] text-slate-400">ID: 19890422</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('19910718', 'password123')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-[11px] text-slate-300 transition-colors"
              >
                <div className="font-bold text-emerald-400">3. Verifikator</div>
                <div className="font-mono text-[10px] text-slate-400">ID: 19910718</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('19871212', 'password123')}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-[11px] text-slate-300 transition-colors"
              >
                <div className="font-bold text-amber-400">4. Multi-Role (2-3 Role)</div>
                <div className="font-mono text-[10px] text-slate-400">ID: 19871212</div>
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-2 font-mono">
              Password default demo: password123
            </p>
          </div>
        </div>
      </div>

      {/* "Lupa Password? Hubungi Admin" Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Bantuan Reset Password</h3>
                <p className="text-xs text-slate-400">Hubungi Administrator Sistem</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p>Sesuai dengan ketentuan operasional:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Pengguna role <strong>SatKer</strong> dan <strong>Verifikator</strong> hanya dapat mengganti password setelah berhasil masuk ke akun masing-masing.</li>
                <li>Jika Anda lupa password akun, silakan hubungi <strong>Super Admin</strong> pada Biro Perencanaan / PDSI Komdigi untuk melakukan reset password akun.</li>
                <li>Kontak Helpdesk TI: <strong>helpdesk-anggaran@komdigi.go.id</strong></li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
