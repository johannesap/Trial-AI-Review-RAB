import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole, SubmissionData } from './types';
import { INITIAL_USERS, INITIAL_SUBMISSIONS } from './data/initialUsers';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { SuperAdminView } from './components/SuperAdminView';
import { SatkerView } from './components/SatkerView';
import { VerifikatorView } from './components/VerifikatorView';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { PromptModal } from './components/PromptModal';

export default function App() {
  // Users State (with LocalStorage fallback & migration check for 8-char IDs)
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('rab_app_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(u => u.id && u.id.length === 8)) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem('rab_app_users');
    return INITIAL_USERS;
  });

  // Submissions State (with LocalStorage fallback & migration check for 8-char IDs)
  const [submissions, setSubmissions] = useState<SubmissionData[]>(() => {
    const saved = localStorage.getItem('rab_app_submissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(s => s.satkerUserId && s.satkerUserId.length === 8)) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem('rab_app_submissions');
    return INITIAL_SUBMISSIONS;
  });

  // Current Logged-in User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('rab_app_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.id.length === 8) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem('rab_app_current_user');
    return null;
  });

  // Active Role (for accounts with 1, 2, or 3 roles)
  const [activeRole, setActiveRole] = useState<UserRole>('satker');

  // Modals
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('rab_app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('rab_app_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rab_app_current_user', JSON.stringify(currentUser));
      // Ensure activeRole is valid for this user
      if (!currentUser.roles.includes(activeRole)) {
        setActiveRole(currentUser.roles[0] || 'satker');
      }
    } else {
      localStorage.removeItem('rab_app_current_user');
    }
  }, [currentUser, activeRole]);

  // Handle Login
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveRole(user.roles[0] || 'satker');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Handle Role Switch (if multi-role account)
  const handleSwitchActiveRole = (newRole: UserRole) => {
    if (currentUser && currentUser.roles.includes(newRole)) {
      setActiveRole(newRole);
      const updatedUser = { ...currentUser, activeRole: newRole };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  };

  // User CRUD by Super Admin
  const handleAddUser = (newUser: UserAccount) => {
    setUsers([newUser, ...users]);
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      if (!updatedUser.roles.includes(activeRole)) {
        setActiveRole(updatedUser.roles[0]);
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  // SatKer & Verifikator Change Password
  const handleUpdatePassword = (newPassword: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, password: newPassword };
    setCurrentUser(updated);
    setUsers(users.map(u => u.id === updated.id ? updated : u));
  };

  // SatKer Submission
  const handleAddSubmission = (newSub: SubmissionData) => {
    setSubmissions([newSub, ...submissions]);
  };

  // Verifikator Decision Update
  const handleUpdateSubmission = (updatedSub: SubmissionData) => {
    setSubmissions(submissions.map(s => s.id === updatedSub.id ? updatedSub : s));
  };

  // If not logged in, render Login View
  if (!currentUser) {
    return (
      <>
        <LoginView
          users={users}
          onLoginSuccess={handleLogin}
          onOpenPromptModal={() => setIsPromptModalOpen(true)}
        />
        <PromptModal
          isOpen={isPromptModalOpen}
          onClose={() => setIsPromptModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onSwitchActiveRole={handleSwitchActiveRole}
        onOpenChangePassword={() => setIsPasswordModalOpen(true)}
        onOpenPromptModal={() => setIsPromptModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Role Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeRole === 'superadmin' && (
          <SuperAdminView
            users={users}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onOpenPromptModal={() => setIsPromptModalOpen(true)}
          />
        )}

        {activeRole === 'satker' && (
          <SatkerView
            currentUser={currentUser}
            onAddSubmission={handleAddSubmission}
            submissions={submissions}
          />
        )}

        {activeRole === 'verifikator' && (
          <VerifikatorView
            currentUser={currentUser}
            submissions={submissions}
            onUpdateSubmission={handleUpdateSubmission}
          />
        )}
      </main>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        currentUser={currentUser}
        onUpdatePassword={handleUpdatePassword}
      />

      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50 print:hidden">
        Sistem Verifikasi &amp; Telaah Otomatis File RAB Berbasis AI &bull; Kementerian Komunikasi dan Digital Republik Indonesia &bull; 2026
      </footer>
    </div>
  );
}
