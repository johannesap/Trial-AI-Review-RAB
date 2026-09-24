import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';
import { Users, UserPlus, Edit3, Trash2, Shield, Key, Search, Check, AlertCircle, CheckCircle, X, ShieldAlert, Sparkles } from 'lucide-react';

interface SuperAdminViewProps {
  users: UserAccount[];
  currentUser: UserAccount;
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  onOpenPromptModal: () => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onOpenPromptModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formRoles, setFormRoles] = useState<UserRole[]>(['satker']);
  const [formPassword, setFormPassword] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingUser(null);
    setFormId('');
    setFormName('');
    setFormUnit('');
    setFormRoles(['satker']);
    setFormPassword('password123');
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setFormId(user.id);
    setFormName(user.name);
    setFormUnit(user.unit);
    setFormRoles([...user.roles]);
    setFormPassword(user.password);
    setFormIsActive(user.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const toggleRoleSelection = (role: UserRole) => {
    if (formRoles.includes(role)) {
      if (formRoles.length === 1) {
        setFormError('Setiap akun minimal harus memiliki 1 role.');
        return;
      }
      setFormRoles(formRoles.filter(r => r !== role));
    } else {
      setFormRoles([...formRoles, role]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedId = formId.trim();

    if (!trimmedId) {
      setFormError('ID pengguna tidak boleh kosong.');
      return;
    }

    if (trimmedId.length !== 8) {
      setFormError('ID pengguna wajib tepat 8 karakter.');
      return;
    }

    if (formRoles.length === 0) {
      setFormError('Pilih minimal satu role untuk akun ini.');
      return;
    }

    // Check duplicate ID when creating new
    if (!editingUser) {
      const exists = users.some(u => u.id === trimmedId);
      if (exists) {
        setFormError(`User ID "${trimmedId}" sudah terdaftar dalam sistem.`);
        return;
      }

      const newUser: UserAccount = {
        id: trimmedId,
        name: formName,
        unit: formUnit || 'Satuan Kerja Komdigi',
        roles: formRoles,
        activeRole: formRoles[0],
        password: formPassword || 'password123',
        isActive: formIsActive,
        createdAt: new Date().toISOString().split('T')[0]
      };

      onAddUser(newUser);
    } else {
      // Editing existing
      const updatedUser: UserAccount = {
        ...editingUser,
        name: formName,
        unit: formUnit,
        roles: formRoles,
        activeRole: formRoles.includes(editingUser.activeRole) ? editingUser.activeRole : formRoles[0],
        password: formPassword,
        isActive: formIsActive
      };

      onUpdateUser(updatedUser);
    }

    setIsModalOpen(false);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchSearch =
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.unit.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole =
      filterRole === 'all' ||
      (filterRole === 'multirole' ? user.roles.length > 1 : user.roles.includes(filterRole as UserRole));

    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
              <Shield className="w-4 h-4" />
              <span>Panel Manajemen Hak Akses Pengguna</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Kelola Akun &amp; Multi-Role Sistem</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Super Admin berwenang melakukan CRUD pada akun Admin, SatKer, dan Verifikator, serta menetapkan 2 hingga 3 role dalam 1 akun tunggal.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenPromptModal}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-amber-300 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Prompt AI Studio</span>
            </button>

            <button
              id="btn-add-new-user"
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Total Pengguna</span>
            <span className="text-xl font-bold text-white font-mono">{users.length}</span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Akun SatKer</span>
            <span className="text-xl font-bold text-indigo-400 font-mono">
              {users.filter(u => u.roles.includes('satker')).length}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Akun Verifikator</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {users.filter(u => u.roles.includes('verifikator')).length}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Akun Multi-Role (2-3 Role)</span>
            <span className="text-xl font-bold text-amber-400 font-mono">
              {users.filter(u => u.roles.length > 1).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-user-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID (NIP), Nama, atau Satuan Kerja..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Filter Role:</span>
          <select
            id="filter-role-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="all">Semua Role</option>
            <option value="superadmin">Super Admin</option>
            <option value="satker">SatKer</option>
            <option value="verifikator">Verifikator</option>
            <option value="multirole">Multi-Role (2+ Role)</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">ID Pengguna (Maks. 20 Karakter)</th>
                <th className="px-5 py-3.5">Nama &amp; Satuan Kerja</th>
                <th className="px-5 py-3.5">Peran / Role (1 s/d 3)</th>
                <th className="px-5 py-3.5">Status Akun</th>
                <th className="px-5 py-3.5 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isMultiRole = u.roles.length > 1;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {u.id}
                          </span>
                          <span className="text-[10px] text-slate-400">({u.id.length} char)</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">{u.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.unit}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {u.roles.map((r) => {
                            let color = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                            if (r === 'superadmin') color = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800';
                            if (r === 'satker') color = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800';
                            if (r === 'verifikator') color = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';

                            return (
                              <span key={r} className={`px-2 py-0.5 rounded text-[11px] font-bold ${color}`}>
                                {r.toUpperCase()}
                              </span>
                            );
                          })}

                          {isMultiRole && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold" title="Akun memiliki multiple role">
                              {u.roles.length} Role
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => onUpdateUser({ ...u, isActive: !u.isActive })}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            u.isActive
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {u.isActive ? 'Aktif' : 'Non-aktif'}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-edit-${u.id}`}
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Akun & Ubah Role"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {u.id !== currentUser.id && (
                            <button
                              id={`btn-delete-${u.id}`}
                              onClick={() => {
                                if (window.confirm(`Yakin ingin menghapus akun ${u.name} (${u.id})?`)) {
                                  onDeleteUser(u.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div 
            id="user-crud-dialog"
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                  {editingUser ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingUser ? 'Edit Pengguna & Pergantian Role' : 'Tambah Pengguna Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">Konfigurasi Hak Akses dan Multi-Role Akun</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* ID Input with 8 Char Limit */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ID Pengguna / NIP (Tepat 8 Karakter)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">{formId.length}/8</span>
                </div>
                <input
                  id="modal-input-user-id"
                  type="text"
                  maxLength={8}
                  required
                  disabled={!!editingUser}
                  value={formId}
                  onChange={(e) => setFormId(e.target.value.replace(/\s+/g, ''))}
                  placeholder="Contoh: 19890422 (8 digit)"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono dark:text-white disabled:opacity-60"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap &amp; Gelar
                </label>
                <input
                  id="modal-input-name"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Dewi Lestari, S.E., M.M."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Satuan Kerja / Unit Eselon
                </label>
                <input
                  id="modal-input-unit"
                  type="text"
                  required
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  placeholder="Contoh: Ditjen Komunikasi Publik dan Media"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              {/* Roles: Multi-Role Assignment (1, 2, or 3 roles!) */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-white">
                    Hak Akses / Roles (Bisa Memilih 2 hingga 3 Role)
                  </label>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    {formRoles.length} Role Terpilih
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Sesuai ketentuan, Super Admin dapat menambah 2 hingga 3 role dalam 1 akun (misal: SatKer sekaligus Verifikator).
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {(['superadmin', 'satker', 'verifikator'] as UserRole[]).map((r) => {
                    const isChecked = formRoles.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRoleSelection(r)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isChecked
                            ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 text-blue-900 dark:text-blue-200'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase">{r}</span>
                          {isChecked ? (
                            <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {r === 'superadmin' ? 'CRUD & Akses Penuh' : r === 'satker' ? 'Upload & Telaah AI' : 'Verifikasi Akhir'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi
                </label>
                <input
                  id="modal-input-password"
                  type="text"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white font-mono"
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="modal-checkbox-active"
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="modal-checkbox-active" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Akun dalam keadaan aktif (Dapat login ke sistem)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  id="btn-save-user-crud"
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
