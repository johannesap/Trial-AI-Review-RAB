import React, { useState } from "react";
import { Users, FolderArchive, FileSpreadsheet, ClipboardCheck, ListChecks, Layers, ChevronsLeft, ChevronsRight, Sparkles, Clock, FileCheck, ChevronDown, Upload, UserPlus, Plus, X } from "lucide-react";
import { UserRole, ActiveMenuKey, UserAccount, StandardMenuKey, ROLE_PERMISSIONS_MATRIX, AccessPermission } from "../types";

interface SidebarProps {
  activeRole: UserRole;
  activeMenu: ActiveMenuKey | string;
  onSelectMenu: (menu: ActiveMenuKey | any) => void;
  onOpenAddUserModal?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser: UserAccount;
  onOpenPromptModal: () => void;
  counts?: {
    users?: number;
    regulations?: number;
    submissions?: number;
    pendingSubmissions?: number;
    completedSubmissions?: number;
    criteria?: number;
    masterRo?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeRole, activeMenu, onSelectMenu, onOpenAddUserModal, isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile, currentUser, onOpenPromptModal, counts = {} }) => {
  const getRoleHeaderInfo = () => {
    switch (activeRole) {
      case "superadmin":
        return {
          title: "Super Admin",
          color: "bg-cyan-600 text-white",
          sub: "Pusat Kendali Pengguna & Regulasi",
          activeBg: "bg-cyan-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-500",
          iconColor: "text-cyan-600 dark:text-cyan-400",
        };
      case "verifikator":
        return {
          title: "ROCAN (verif)",
          color: "bg-emerald-600 text-white",
          sub: "Biro Perencanaan & Verifikasi RAB",
          activeBg: "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-500",
          iconColor: "text-emerald-600 dark:text-emerald-400",
        };
      case "satker":
        return {
          title: "Satker",
          color: "bg-blue-600 text-white",
          sub: "Pengusul & Pembuat Dokumen RAB",
          activeBg: "bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-500",
          iconColor: "text-blue-600 dark:text-blue-400",
        };
    }
  };

  const roleInfo = getRoleHeaderInfo();
  const isSidebarCompact = isCollapsed && !isMobileOpen;

  const [isVerificationExpanded, setIsVerificationExpanded] = useState(true);
  const [isRabListExpanded, setIsRabListExpanded] = useState(true);

  const isUsersActive = activeMenu === "menu_users" || activeMenu === "admin_users" || activeMenu === "admin_add_user";
  const isAcuanActive = activeMenu === "menu_acuan" || activeMenu === "admin_regulations" || (activeMenu as string) === "admin_add_regulation";
  const isMasterRoActive = activeMenu === "menu_master_ro" || (activeMenu as string) === "master_ro_list" || (activeMenu as string) === "master_ro_add";
  const isVerificationActive = activeMenu === "menu_verification" || activeMenu === "verifikator_review" || activeMenu === "verifikator_pending" || activeMenu === "verifikator_completed";
  const isRabListActive = activeMenu === "menu_rab_list" || activeMenu === "satker_list" || activeMenu === "satker_form";

  // Auto-expand verification branches when active
  React.useEffect(() => {
    if (isVerificationActive) {
      setIsVerificationExpanded(true);
    }
  }, [isVerificationActive]);

  // Auto-expand Daftar RAB branches when active
  React.useEffect(() => {
    if (isRabListActive) {
      setIsRabListExpanded(true);
    }
  }, [isRabListActive]);

  // Helper to determine if a standard menu key is currently active
  const isMenuActive = (targetKey: StandardMenuKey) => {
    if (activeMenu === targetKey) return true;
    if (targetKey === "menu_users" && isUsersActive) return true;
    if (targetKey === "menu_acuan" && isAcuanActive) return true;
    if (targetKey === "menu_checklist" && activeMenu === "verifikator_checklist") return true;
    if (targetKey === "menu_master_ro" && isMasterRoActive) return true;
    if (targetKey === "menu_rab_list" && isRabListActive) return true;
    if (targetKey === "menu_verification" && isVerificationActive) return true;
    return false;
  };

  // Master definitions of the 6 functional menus
  const allMenuItems: Array<{
    key: StandardMenuKey;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badgeCount?: number;
  }> = [
    {
      key: "menu_users",
      label: "Management User",
      sublabel: "Hak Akses & Kelola Akun",
      icon: Users,
      badgeCount: counts.users ?? 3,
    },
    {
      key: "menu_acuan",
      label: "Input Acuan",
      sublabel: "Ketentuan & Regulasi AI",
      icon: FolderArchive,
      badgeCount: counts.regulations ?? 2,
    },
    {
      key: "menu_checklist",
      label: "Input Checklist",
      sublabel: "Master 20 Kriteria AI",
      icon: ListChecks,
      badgeCount: counts.criteria ?? 20,
    },
    {
      key: "menu_master_ro",
      label: "Input Master RO",
      sublabel: "Katalog & Hierarki RO",
      icon: Layers,
      badgeCount: counts.masterRo ?? 58,
    },
    {
      key: "menu_rab_list",
      label: "Daftar RAB",
      sublabel: "Riwayat & Pengajuan RAB",
      icon: FileSpreadsheet,
      badgeCount: counts.submissions ?? 0,
    },
    {
      key: "menu_verification",
      label: "> Verifikasi",
      sublabel: "Telaah Dokumen & Evaluasi",
      icon: ClipboardCheck,
      badgeCount: counts.pendingSubmissions ?? 0,
    },
  ];

  // Specific ordering per role:
  // - Super Admin: 1 to 6
  // - ROCAN (verif): Input Acuan, Input Checklist, Input Master RO, > Verifikasi
  // - Satker: Daftar RAB, > Verifikasi, Input Acuan, Input Checklist, Input Master RO
  const getOrderedMenuKeysForRole = (role: UserRole): StandardMenuKey[] => {
    switch (role) {
      case "superadmin":
        return ["menu_users", "menu_acuan", "menu_checklist", "menu_master_ro", "menu_rab_list", "menu_verification"];
      case "verifikator":
        return ["menu_acuan", "menu_checklist", "menu_master_ro", "menu_verification"];
      case "satker":
        return ["menu_rab_list", "menu_verification", "menu_acuan", "menu_checklist", "menu_master_ro"];
    }
  };

  const orderedKeys = getOrderedMenuKeysForRole(activeRole);

  // Filter out any menu where permission is "NONE"
  const visibleMenus = orderedKeys
    .map((key) => {
      const item = allMenuItems.find((m) => m.key === key);
      const perm: AccessPermission = ROLE_PERMISSIONS_MATRIX[key]?.[activeRole] || "NONE";
      return { item, permission: perm };
    })
    .filter((entry): entry is { item: (typeof allMenuItems)[0]; permission: AccessPermission } => {
      return entry.item !== undefined && entry.permission !== "NONE";
    });

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto bg-white dark:bg-slate-900 border-r border-sky-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 md:static md:inset-auto md:z-30 md:max-w-none md:overflow-visible md:transition-[width] shrink-0 select-none shadow-xs ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 ${isCollapsed ? "md:w-20" : "md:w-64"}`}
    >
      {/* Top Header & Navigation Links */}
      <div>
        {/* Sidebar Header & Collapse Toggle */}
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-sky-100 dark:border-slate-800">
          {!isSidebarCompact ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">Menu Navigasi</span>
            </div>
          ) : (
            <div className="w-full flex justify-center">{/* Spacer when collapsed */}</div>
          )}

          {/* Collapse Toggle Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Tutup Menu Navigasi"
            aria-label="Tutup menu navigasi"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden md:inline-flex p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={isSidebarCompact ? "Perluas Sidebar" : "Perkecil Sidebar"}
            type="button"
          >
            {isSidebarCompact ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Dedicated Role Badge Section (Single Role) */}
        <div className="px-4 pt-4 pb-2">
          {!isSidebarCompact ? (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Role Akun</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{roleInfo.title}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleInfo.color}`}>Aktif</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className={`w-3 h-3 rounded-full ${roleInfo.color}`} title={roleInfo.title} />
            </div>
          )}
        </div>

        {/* Section Title */}
        <div className="px-5 pt-3 pb-1">
          {!isSidebarCompact ? (
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Menu Akses</span>
              <span className="text-[10px] text-slate-400 font-mono">{visibleMenus.length} Menu</span>
            </div>
          ) : (
            <div className="h-2 border-b border-slate-100 dark:border-slate-800"></div>
          )}
        </div>

        {/* Dynamic Navigation Items based on RBAC matrix */}
        <nav className="px-3 space-y-1.5 pt-2">
          {visibleMenus.map(({ item, permission }) => {
            const isRabList = item.key === "menu_rab_list";
            const isVerification = item.key === "menu_verification";
            const active = isMenuActive(item.key);
            const Icon = item.icon;

            if (isRabList) {
              const isListActive = activeMenu === "satker_list" || (isRabListActive && activeMenu !== "satker_form");
              const isFormActive = activeMenu === "satker_form";

              return (
                <div key={item.key} className="space-y-1">
                  {/* Parent: Daftar RAB */}
                  <button
                    id={`sidebar-menu-${item.key}`}
                    type="button"
                    onClick={() => {
                      if (isSidebarCompact) {
                        onSelectMenu("satker_list");
                      } else {
                        if (isRabListActive) {
                          setIsRabListExpanded((prev) => !prev);
                        } else {
                          setIsRabListExpanded(true);
                          onSelectMenu("satker_list");
                        }
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-bold transition-all cursor-pointer ${
                      active ? roleInfo.activeBg : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title={`${item.label} (${permission === "E" ? "Edit" : "View Only"})`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-5 h-5 shrink-0 ${active ? "text-white" : roleInfo.iconColor}`} />
                      {!isSidebarCompact && (
                        <div className="truncate">
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            <span>{item.label}</span>
                          </div>
                          <div className={`text-[10px] font-normal truncate ${active ? "text-white/80" : "text-slate-400 dark:text-slate-500"}`}>{item.sublabel}</div>
                        </div>
                      )}
                    </div>

                    {!isSidebarCompact && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* E / V Permission Indicator Pill */}
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border select-none ${
                            active
                              ? "bg-white/20 text-white border-white/30"
                              : permission === "E"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                          }`}
                          title={permission === "E" ? "Hak Akses: Edit (E)" : "Hak Akses: View Only (V)"}
                        >
                          {permission === "E" ? "E" : "V"}
                        </span>

                        {/* Numeric Count Pill if available */}
                        {item.badgeCount !== undefined && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                              active ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {item.badgeCount}
                          </span>
                        )}

                        {/* Expand/Collapse Chevron indicator */}
                        <span className={`text-current transition-transform duration-200 ${isRabListExpanded ? "rotate-180" : ""}`}>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Sub-menu Branches (Cabang) under Daftar RAB */}
                  {!isSidebarCompact && isRabListExpanded && (
                    <div className="ml-4 pl-3 border-l-2 border-slate-300 dark:border-slate-700 space-y-1 pt-1 pb-1 transition-all">
                      {/* Branch 1: Daftar & Riwayat RAB */}
                      <button
                        id="sidebar-submenu-satker-list"
                        type="button"
                        onClick={() => onSelectMenu("satker_list")}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                          isListActive
                            ? "bg-blue-100/90 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700/80 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                        title="Daftar & Riwayat Dokumen RAB"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileSpreadsheet className={`w-3.5 h-3.5 shrink-0 ${isListActive ? "text-blue-600 dark:text-blue-400 font-bold" : "text-blue-500"}`} />
                          <span className="truncate">Daftar &amp; Riwayat</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                            isListActive ? "bg-blue-600 text-white shadow-2xs" : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {counts.submissions ?? 0}
                        </span>
                      </button>

                      {/* Branch 2: Form Pengajuan Baru */}
                      <button
                        id="sidebar-submenu-satker-form"
                        type="button"
                        onClick={() => onSelectMenu("satker_form")}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                          isFormActive
                            ? "bg-blue-100/90 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700/80 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                        title="Form Pengajuan RAB Baru"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Upload className={`w-3.5 h-3.5 shrink-0 ${isFormActive ? "text-blue-600 dark:text-blue-400 font-bold" : "text-blue-500"}`} />
                          <span className="truncate">Pengajuan Baru</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                            isFormActive ? "bg-blue-600 text-white shadow-2xs" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          + Baru
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (isVerification) {
              const isPendingActive = activeMenu === "verifikator_pending" || (isVerificationActive && activeMenu !== "verifikator_completed");
              const isCompletedActive = activeMenu === "verifikator_completed";

              return (
                <div key={item.key} className="space-y-1">
                  {/* Parent: > Verifikasi */}
                  <button
                    id={`sidebar-menu-${item.key}`}
                    type="button"
                    onClick={() => {
                      if (isSidebarCompact) {
                        onSelectMenu("verifikator_pending");
                      } else {
                        if (isVerificationActive) {
                          setIsVerificationExpanded((prev) => !prev);
                        } else {
                          setIsVerificationExpanded(true);
                          onSelectMenu("verifikator_pending");
                        }
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-bold transition-all cursor-pointer ${
                      active ? roleInfo.activeBg : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title={`${item.label} (${permission === "E" ? "Edit" : "View Only"})`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-5 h-5 shrink-0 ${active ? "text-white" : roleInfo.iconColor}`} />
                      {!isSidebarCompact && (
                        <div className="truncate">
                          <div className="text-xs font-bold truncate flex items-center gap-1.5">
                            <span>{item.label}</span>
                          </div>
                          <div className={`text-[10px] font-normal truncate ${active ? "text-white/80" : "text-slate-400 dark:text-slate-500"}`}>{item.sublabel}</div>
                        </div>
                      )}
                    </div>

                    {!isSidebarCompact && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* E / V Permission Indicator Pill */}
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border select-none ${
                            active
                              ? "bg-white/20 text-white border-white/30"
                              : permission === "E"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                          }`}
                          title={permission === "E" ? "Hak Akses: Edit (E)" : "Hak Akses: View Only (V)"}
                        >
                          {permission === "E" ? "E" : "V"}
                        </span>

                        {/* Numeric Count Pill if available */}
                        {item.badgeCount !== undefined && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                              active ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {item.badgeCount}
                          </span>
                        )}

                        {/* Expand/Collapse Chevron indicator */}
                        <span className={`text-current transition-transform duration-200 ${isVerificationExpanded ? "rotate-180" : ""}`}>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Sub-menu Branches (Cabang) under > Verifikasi */}
                  {!isSidebarCompact && isVerificationExpanded && (
                    <div className="ml-4 pl-3 border-l-2 border-slate-300 dark:border-slate-700 space-y-1 pt-1 pb-1 transition-all">
                      {/* Branch 1: Dokumen Menunggu Telaah */}
                      <button
                        id="sidebar-submenu-verifikator-pending"
                        type="button"
                        onClick={() => onSelectMenu("verifikator_pending")}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                          isPendingActive
                            ? "bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                        title="Dokumen Menunggu Telaah Verifikator"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className={`w-3.5 h-3.5 shrink-0 ${isPendingActive ? "text-amber-600 dark:text-amber-400 font-bold" : "text-amber-500"}`} />
                          <span className="truncate">Dokumen Menunggu</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                            isPendingActive
                              ? "bg-amber-500 text-white shadow-2xs"
                              : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {counts.pendingSubmissions ?? 0}
                        </span>
                      </button>

                      {/* Branch 2: Laporan Selesai */}
                      <button
                        id="sidebar-submenu-verifikator-completed"
                        type="button"
                        onClick={() => onSelectMenu("verifikator_completed")}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                          isCompletedActive
                            ? "bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/80 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                        title="Laporan Selesai (Diterima & Ditolak)"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCheck className={`w-3.5 h-3.5 shrink-0 ${isCompletedActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-emerald-500"}`} />
                          <span className="truncate">Laporan Selesai</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                            isCompletedActive
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          }`}
                        >
                          {counts.completedSubmissions ?? 0}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.key}
                id={`sidebar-menu-${item.key}`}
                type="button"
                onClick={() => onSelectMenu(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-bold transition-all cursor-pointer ${
                  active ? roleInfo.activeBg : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title={`${item.label} (${permission === "E" ? "Edit" : "View Only"})`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${active ? "text-white" : roleInfo.iconColor}`} />
                  {!isSidebarCompact && (
                    <div className="truncate">
                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                        <span>{item.label}</span>
                      </div>
                      <div className={`text-[10px] font-normal truncate ${active ? "text-white/80" : "text-slate-400 dark:text-slate-500"}`}>{item.sublabel}</div>
                    </div>
                  )}
                </div>

                {!isSidebarCompact && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* E / V Permission Indicator Pill */}
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border select-none ${
                        active
                          ? "bg-white/20 text-white border-white/30"
                          : permission === "E"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                      }`}
                      title={permission === "E" ? "Hak Akses: Edit (E)" : "Hak Akses: View Only (V)"}
                    >
                      {permission === "E" ? "E" : "V"}
                    </span>

                    {/* Numeric Count Pill if available */}
                    {item.badgeCount !== undefined && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                          active ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {item.badgeCount}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section: Prompt AI Studio & User Snapshot */}
      <div className="p-3 border-t border-sky-100 dark:border-slate-800 space-y-2">
        <button
          onClick={onOpenPromptModal}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 transition-colors shadow-2xs cursor-pointer"
          title="Master Prompt Gemini AI Studio & Python Backend"
        >
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          {!isSidebarCompact && <span className="truncate">Prompt AI Studio</span>}
        </button>

        {!isSidebarCompact && (
          <div className="px-2.5 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
            <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
              <span>NIP: {currentUser.id}</span>
              <span className={`px-1.5 py-0.2 rounded font-bold ${roleInfo.color}`}>{roleInfo.title}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
