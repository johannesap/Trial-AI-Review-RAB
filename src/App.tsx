import React, { useState, useEffect } from "react";
import { UserAccount, UserRole, SubmissionData, RegulationDocument, ActiveMenuKey, StandardMenuKey, ROLE_PERMISSIONS_MATRIX, HierarchyItem } from "./types";
import { INITIAL_USERS, INITIAL_SUBMISSIONS } from "./data/initialUsers";
import { INITIAL_REGULATIONS } from "./data/initialRegulations";
import { HIERARCHY_DATA } from "./data/budgetData";
import { LoginView } from "./components/LoginView";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { SuperAdminView } from "./components/SuperAdminView";
import { SatkerView } from "./components/SatkerView";
import { VerifikatorView } from "./components/VerifikatorView";
import { MasterRoView } from "./components/MasterRoView";
import { ChangePasswordModal } from "./components/ChangePasswordModal";

// Helper to map any ActiveMenuKey to StandardMenuKey
export const toStandardMenuKey = (menuKey: ActiveMenuKey | string): StandardMenuKey => {
  switch (menuKey) {
    case "menu_users":
    case "admin_users":
    case "admin_add_user":
      return "menu_users";
    case "menu_acuan":
    case "admin_regulations":
    case "admin_add_regulation":
      return "menu_acuan";
    case "menu_checklist":
    case "verifikator_checklist":
      return "menu_checklist";
    case "menu_master_ro":
    case "master_ro_list":
    case "master_ro_add":
      return "menu_master_ro";
    case "menu_rab_list":
    case "satker_list":
    case "satker_form":
      return "menu_rab_list";
    case "menu_verification":
    case "verifikator_review":
    case "verifikator_pending":
    case "verifikator_completed":
      return "menu_verification";
    default:
      return "menu_users";
  }
};

// Default menu when entering a role
export const getDefaultMenuForRole = (role: UserRole): StandardMenuKey => {
  switch (role) {
    case "superadmin":
      return "menu_users";
    case "verifikator":
      return "menu_acuan";
    case "satker":
      return "menu_rab_list";
  }
};

export default function App() {
  // Users State (Single-Role per User: Super Admin, Satker, Verifikator; filter out old multi-role id "19871212")
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem("rab_app_users");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((u) => u.id && u.id.length === 8)) {
          return parsed.filter((u: UserAccount) => u.id !== "19871212");
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem("rab_app_users");
    return INITIAL_USERS;
  });

  // Regulations State (Dokumen Peraturan / Standar SBM yang dimasukkan Super Admin / ROCAN)
  const [regulations, setRegulations] = useState<RegulationDocument[]>(() => {
    const saved = localStorage.getItem("rab_app_regulations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_REGULATIONS;
  });

  // Master RO & Hierarki State
  const [masterRoList, setMasterRoList] = useState<HierarchyItem[]>(() => {
    const saved = localStorage.getItem("rab_app_master_ro");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return HIERARCHY_DATA.map((item, idx) => ({ ...item, id: `ro_${idx + 1}` }));
  });

  // Submissions State
  const [submissions, setSubmissions] = useState<SubmissionData[]>(() => {
    const saved = localStorage.getItem("rab_app_submissions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((s) => s.satkerUserId && s.satkerUserId.length === 8)) {
          // Clean stale blob URLs from past sessions
          const cleaned = parsed.map((s: SubmissionData) => {
            if (s.pdfDataUrl && s.pdfDataUrl.startsWith("blob:")) {
              const { pdfDataUrl, ...rest } = s;
              return rest as SubmissionData;
            }
            return s;
          });
          const hasDitolak = cleaned.some((s: SubmissionData) => s.verificationStatus === "Ditolak");
          if (!hasDitolak) {
            const ditolakMock = INITIAL_SUBMISSIONS.find((s) => s.verificationStatus === "Ditolak");
            if (ditolakMock) {
              return [...cleaned, ditolakMock];
            }
          }
          return cleaned;
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem("rab_app_submissions");
    return INITIAL_SUBMISSIONS;
  });

  // Current Logged-in User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem("rab_app_current_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.id.length === 8 && parsed.id !== "19871212") {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem("rab_app_current_user");
    return null;
  });

  // Dedicated Single Role per Account
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    if (currentUser) {
      return currentUser.roles[0] || currentUser.activeRole || "satker";
    }
    return "satker";
  });

  // Dynamic Navigation Menu Key - initialized according to activeRole & RBAC table
  const [activeMenu, setActiveMenu] = useState<ActiveMenuKey>(() => {
    const savedUser = localStorage.getItem("rab_app_current_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.roles && u.roles[0]) {
          return getDefaultMenuForRole(u.roles[0]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return "menu_users";
  });

  // Sidebar Collapsed State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [activeMenu]);

  // Theme State: 'light' or 'dark' (Persistent)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("rab_app_theme");
    if (saved === "dark" || saved === "light") return saved;
    return "light";
  });

  // Sync theme to <html> tag classList and localStorage
  useEffect(() => {
    localStorage.setItem("rab_app_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Modals
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [addUserModalTrigger, setAddUserModalTrigger] = useState(0);

  // Sync to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem("rab_app_users", JSON.stringify(users));
    } catch (e) {
      console.warn("Could not sync users to localStorage:", e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem("rab_app_master_ro", JSON.stringify(masterRoList));
    } catch (e) {
      console.warn("Could not sync masterRoList to localStorage:", e);
    }
  }, [masterRoList]);

  useEffect(() => {
    try {
      const sanitized = regulations.map((reg) => {
        if (reg.pdfDataUrl && (reg.pdfDataUrl.startsWith("blob:") || reg.pdfDataUrl.length > 20000)) {
          const { pdfDataUrl, ...rest } = reg;
          return rest;
        }
        return reg;
      });
      localStorage.setItem("rab_app_regulations", JSON.stringify(sanitized));
    } catch (e) {
      console.warn("Could not sync regulations to localStorage:", e);
      try {
        const stripped = regulations.map(({ pdfDataUrl, ...rest }) => rest);
        localStorage.setItem("rab_app_regulations", JSON.stringify(stripped));
      } catch (e2) {
        console.warn("Fallback sync regulations failed:", e2);
      }
    }
  }, [regulations]);

  useEffect(() => {
    try {
      const sanitized = submissions.map((sub) => {
        if (sub.pdfDataUrl && (sub.pdfDataUrl.startsWith("blob:") || sub.pdfDataUrl.length > 20000)) {
          const { pdfDataUrl, ...rest } = sub;
          return rest;
        }
        return sub;
      });
      localStorage.setItem("rab_app_submissions", JSON.stringify(sanitized));
    } catch (e) {
      console.warn("Could not sync submissions to localStorage:", e);
      try {
        const stripped = submissions.map(({ pdfDataUrl, ...rest }) => rest);
        localStorage.setItem("rab_app_submissions", JSON.stringify(stripped));
      } catch (e2) {
        console.warn("Fallback sync submissions failed:", e2);
      }
    }
  }, [submissions]);

  // Sync currentUser and verify activeMenu permission
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("rab_app_current_user", JSON.stringify(currentUser));
        const role = currentUser.roles[0] || currentUser.activeRole || "satker";
        setActiveRole(role);

        // Ensure activeMenu is allowed for the user's role
        setActiveMenu((currMenu) => {
          const std = toStandardMenuKey(currMenu);
          const perm = ROLE_PERMISSIONS_MATRIX[std]?.[role] || "NONE";
          if (perm !== "NONE") {
            return currMenu;
          }
          return getDefaultMenuForRole(role);
        });
      } else {
        localStorage.removeItem("rab_app_current_user");
      }
    } catch (e) {
      console.warn("Could not sync currentUser to localStorage:", e);
    }
  }, [currentUser]);

  // Handle Login
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    const role = user.roles[0] || user.activeRole || "satker";
    setActiveRole(role);
    setActiveMenu(getDefaultMenuForRole(role));
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("rab_app_current_user");
  };

  // User CRUD by Super Admin
  const handleAddUser = (newUser: UserAccount) => {
    setUsers([newUser, ...users]);
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      const role = updatedUser.roles[0] || updatedUser.activeRole || "satker";
      setActiveRole(role);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  // Regulation Documents CRUD
  const handleAddRegulation = (newReg: RegulationDocument) => {
    setRegulations([newReg, ...regulations]);
  };

  const handleUpdateRegulation = (updatedReg: RegulationDocument) => {
    setRegulations(regulations.map((r) => (r.id === updatedReg.id ? updatedReg : r)));
  };

  const handleDeleteRegulation = (regId: string) => {
    setRegulations(regulations.filter((r) => r.id !== regId));
  };

  const handleToggleRegulationActive = (regId: string) => {
    setRegulations(regulations.map((r) => (r.id === regId ? { ...r, isActive: !r.isActive } : r)));
  };

  // Master RO CRUD
  const handleAddMasterRo = (newItem: HierarchyItem) => {
    setMasterRoList([newItem, ...masterRoList]);
  };

  const handleUpdateMasterRo = (updatedItem: HierarchyItem) => {
    setMasterRoList(masterRoList.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  const handleDeleteMasterRo = (itemId: string) => {
    setMasterRoList(masterRoList.filter((item) => item.id !== itemId));
  };

  // Change Password
  const handleUpdatePassword = (newPassword: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, password: newPassword };
    setCurrentUser(updated);
    setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
  };

  // SatKer Submission
  const handleAddSubmission = (newSub: SubmissionData) => {
    setSubmissions([newSub, ...submissions]);
  };

  // Verifikator Decision Update
  const handleUpdateSubmission = (updatedSub: SubmissionData) => {
    setSubmissions(submissions.map((s) => (s.id === updatedSub.id ? updatedSub : s)));
  };

  // SatKer / Super Admin Delete Submission
  const handleDeleteSubmission = (submissionId: string) => {
    setSubmissions(submissions.filter((s) => s.id !== submissionId));
  };

  // If not logged in, render Login View
  if (!currentUser) {
    return <LoginView users={users} theme={theme} onToggleTheme={handleToggleTheme} onLoginSuccess={handleLogin} />;
  }

  // Canonical standard menu and permission for current view
  const stdKey = toStandardMenuKey(activeMenu);
  const currentPermission = ROLE_PERMISSIONS_MATRIX[stdKey]?.[activeRole] || "NONE";

  return (
    <div className="min-h-screen bg-sky-100/75 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 antialiased">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenChangePassword={() => setIsPasswordModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Dashboard Layout: Sidebar di sebelah kiri + MainContent di sebelah kanan */}
      <div className="flex-1 flex min-w-0 overflow-visible md:overflow-hidden">
        {isMobileSidebarOpen && (
          <button
            type="button"
            aria-label="Tutup menu navigasi"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
          />
        )}
        {/* Sidebar Navigasi Dinamis Berdasarkan Role (Super Admin, ROCAN, Satker) */}
        <Sidebar
          activeRole={activeRole}
          activeMenu={activeMenu}
          onSelectMenu={(menu) => {
            setActiveMenu(menu);
            setIsMobileSidebarOpen(false);
          }}
          onOpenAddUserModal={() => {
            setActiveMenu("admin_add_user");
            setAddUserModalTrigger((prev) => prev + 1);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          currentUser={currentUser}
          counts={{
            users: users.length,
            regulations: regulations.filter((r) => r.isActive).length,
            submissions: submissions.length,
            pendingSubmissions: submissions.filter((s) => s.verificationStatus === "Menunggu").length,
            completedSubmissions: submissions.filter((s) => s.verificationStatus === "Diterima" || s.verificationStatus === "Ditolak").length,
            criteria: 20,
            masterRo: masterRoList.length,
          }}
        />

        {/* MainContent: Area Dinamis Menampilkan Isi Halaman Sesuai Matriks Hak Akses (E & V) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            {currentPermission === "NONE" ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
                <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Anda tidak memiliki hak akses ke modul menu ini.</p>
                <button
                  type="button"
                  onClick={() => setActiveMenu(getDefaultMenuForRole(activeRole))}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Kembali ke Menu Utama
                </button>
              </div>
            ) : (
              <>
                {/* 1. MANAGEMENT USER */}
                {stdKey === "menu_users" && (
                  <SuperAdminView
                    users={users}
                    currentUser={currentUser}
                    regulations={regulations}
                    activeMenu={activeMenu}
                    permission="E"
                    onSelectMenu={setActiveMenu}
                    addUserModalTrigger={addUserModalTrigger}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                    onAddRegulation={handleAddRegulation}
                    onUpdateRegulation={handleUpdateRegulation}
                    onDeleteRegulation={handleDeleteRegulation}
                    onToggleRegulationActive={handleToggleRegulationActive}
                  />
                )}

                {/* 2. INPUT ACUAN (ARSIP REGULASI) */}
                {stdKey === "menu_acuan" && (
                  <SuperAdminView
                    users={users}
                    currentUser={currentUser}
                    regulations={regulations}
                    activeMenu={activeMenu}
                    permission={currentPermission}
                    onSelectMenu={setActiveMenu}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                    onAddRegulation={handleAddRegulation}
                    onUpdateRegulation={handleUpdateRegulation}
                    onDeleteRegulation={handleDeleteRegulation}
                    onToggleRegulationActive={handleToggleRegulationActive}
                  />
                )}

                {/* 3. INPUT CHECKLIST (MASTER 20 KRITERIA) */}
                {stdKey === "menu_checklist" && (
                  <VerifikatorView
                    currentUser={currentUser}
                    submissions={submissions}
                    onUpdateSubmission={handleUpdateSubmission}
                    activeMenu="verifikator_checklist"
                    permission={currentPermission}
                    onSelectMenu={setActiveMenu}
                    regulations={regulations}
                  />
                )}

                {/* 4. INPUT MASTER RO */}
                {stdKey === "menu_master_ro" && (
                  <MasterRoView
                    permission={currentPermission}
                    currentUser={currentUser}
                    hierarchyData={masterRoList}
                    onAddMasterRo={handleAddMasterRo}
                    onUpdateMasterRo={handleUpdateMasterRo}
                    onDeleteMasterRo={handleDeleteMasterRo}
                    activeMenu={activeMenu}
                    onSelectMenu={setActiveMenu}
                  />
                )}

                {/* 5. DAFTAR RAB (PENGAJUAN & RIWAYAT) */}
                {stdKey === "menu_rab_list" && (
                  <SatkerView
                    currentUser={currentUser}
                    onAddSubmission={handleAddSubmission}
                    onUpdateSubmission={handleUpdateSubmission}
                    onDeleteSubmission={handleDeleteSubmission}
                    submissions={submissions}
                    regulations={regulations}
                    activeMenu={activeMenu}
                    onSelectMenu={setActiveMenu}
                  />
                )}

                {/* 6. > VERIFIKASI (TELAAH ANGGARAN & PENILAIAN AI) */}
                {stdKey === "menu_verification" && (
                  <VerifikatorView
                    currentUser={currentUser}
                    submissions={submissions}
                    onUpdateSubmission={handleUpdateSubmission}
                    activeMenu={activeMenu}
                    permission={currentPermission}
                    onSelectMenu={setActiveMenu}
                    regulations={regulations}
                  />
                )}
              </>
            )}
          </main>

          {/* Clean Minimalist Footer */}
          <footer className="border-t border-sky-200/80 dark:border-slate-800/80 py-4 text-center text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs print:hidden transition-colors">
            Sistem Verifikasi &amp; Telaah Otomatis File RAB Berbasis AI &bull; Kementerian Komunikasi dan Digital Republik Indonesia &bull; 2026
          </footer>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} currentUser={currentUser} onUpdatePassword={handleUpdatePassword} />
    </div>
  );
}
