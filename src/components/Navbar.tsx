import React from "react";
import { UserAccount, UserRole } from "../types";
import { KeyRound, LogOut, Sparkles, Sun, Moon } from "lucide-react";

interface NavbarProps {
  currentUser: UserAccount;
  activeRole: UserRole;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenChangePassword: () => void;
  onOpenPromptModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, activeRole, theme, onToggleTheme, onOpenChangePassword, onOpenPromptModal, onLogout }) => {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "superadmin":
        return "bg-cyan-600 text-white";
      case "satker":
        return "bg-blue-600 text-white";
      case "verifikator":
        return "bg-emerald-600 text-white";
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case "superadmin":
        return "Super Admin";
      case "satker":
        return "Satker";
      case "verifikator":
        return "ROCAN (verif)";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-2xs print:hidden transition-colors">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: App Identity (Pojok Kiri Atas) */}
        <div className="flex items-center gap-3">
          <img src="/logo-komdigi-emblem.svg" alt="Logo Kementerian Komunikasi dan Digital RI" className="w-10 h-10 object-contain drop-shadow-xs shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Sistem Pengecekan File RAB AI</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 rounded-md">OptiMa</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">v2.6</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">Kementerian Komunikasi dan Digital RI &bull; Telaah Anggaran Berbasis LLM</p>
          </div>
        </div>

        {/* Right: Actions, Single Role Badge & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Master Prompt AI Studio & Python Backend button */}
          <button
            id="btn-nav-prompt-modal"
            onClick={onOpenPromptModal}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Lihat Prompt Gemini AI Studio & Panduan Backend Python"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Prompt AI Studio</span>
          </button>

          {/* Theme Toggle Button (Light / Dark Mode) */}
          <button
            id="btn-toggle-theme"
            type="button"
            onClick={onToggleTheme}
            className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center"
            title={theme === "dark" ? "Beralih ke Mode Terang (Light Mode)" : "Beralih ke Mode Gelap (Dark Mode)"}
            aria-label="Toggle Dark Mode"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Single Dedicated Role Indicator (No Multi-Role Switcher) */}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getRoleBadgeColor(activeRole)}`}>{getRoleDisplayName(activeRole)}</span>

          {/* Change Password (for SatKer, Verifikator, SuperAdmin) */}
          <button
            id="btn-nav-change-password"
            onClick={onOpenChangePassword}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Ganti Password Akun"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden lg:block">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate max-w-44">{currentUser.name}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">NIP: {currentUser.id}</span>
            </div>

            <button id="btn-logout" onClick={onLogout} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer" title="Keluar dari Sistem">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
