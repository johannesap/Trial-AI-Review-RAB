import React from 'react';
import { UserAccount, UserRole } from '../types';
import { ShieldCheck, KeyRound, LogOut, Sparkles, User, RefreshCw, Layers } from 'lucide-react';

interface NavbarProps {
  currentUser: UserAccount;
  activeRole: UserRole;
  onSwitchActiveRole: (role: UserRole) => void;
  onOpenChangePassword: () => void;
  onOpenPromptModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeRole,
  onSwitchActiveRole,
  onOpenChangePassword,
  onOpenPromptModal,
  onLogout
}) => {
  const hasMultipleRoles = currentUser.roles.length > 1;

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'bg-blue-600 text-white';
      case 'satker':
        return 'bg-indigo-600 text-white';
      case 'verifikator':
        return 'bg-emerald-600 text-white';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'satker':
        return 'SatKer Pengusul';
      case 'verifikator':
        return 'Verifikator Anggaran';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: App Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Sistem Pengecekan File RAB AI
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                v2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
              Kementerian Komunikasi dan Digital RI &bull; Telaah Anggaran Berbasis LLM
            </p>
          </div>
        </div>

        {/* Right: Actions, Role Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Master Prompt AI Studio & Python Backend button */}
          <button
            id="btn-nav-prompt-modal"
            onClick={onOpenPromptModal}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Lihat Prompt Gemini AI Studio & Panduan Backend Python (FastAPI + PostgreSQL)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Prompt AI Studio</span>
          </button>

          {/* Multi-Role Switcher (If account has 2 or 3 roles) */}
          {hasMultipleRoles && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 px-2 hidden sm:inline flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-blue-500" />
                Ganti Role:
              </span>
              <div className="flex gap-1">
                {currentUser.roles.map((r) => {
                  const isActive = r === activeRole;
                  return (
                    <button
                      key={r}
                      id={`btn-switch-role-${r}`}
                      onClick={() => onSwitchActiveRole(r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? getRoleBadgeColor(r) + ' shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {r.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Single Role Indicator if not multi-role */}
          {!hasMultipleRoles && (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getRoleBadgeColor(activeRole)}`}>
              {getRoleDisplayName(activeRole)}
            </span>
          )}

          {/* Change Password (for SatKer & Verifikator) */}
          {(activeRole === 'satker' || activeRole === 'verifikator' || activeRole === 'superadmin') && (
            <button
              id="btn-nav-change-password"
              onClick={onOpenChangePassword}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Ganti Password Akun"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          )}

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden lg:block">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate max-w-44">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                NIP: {currentUser.id}
              </span>
            </div>

            <button
              id="btn-logout"
              onClick={onLogout}
              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              title="Keluar dari Sistem"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
