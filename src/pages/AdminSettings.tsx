import { useState } from 'react';
import { useRole, useTaxonomy, useUsers } from '../hooks/useStore';
import { addTaxonomyItem, removeTaxonomyItem, renameTaxonomyItem, addUser, updateUser, deleteUser } from '../store';
import { Link } from 'react-router-dom';
import type { Role } from '../types';
import type { UserAccount } from '../store';
import type { Taxonomy } from '../types';

const taxonomyLabels: Record<keyof Taxonomy, string> = {
  countries: 'Countries',
  themes: 'Themes',
  reportingPeriods: 'Reporting Periods',
  documentTypes: 'Document Types',
  projects: 'Projects',
  contributors: 'Contributors',
};

const roleOptions: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'external', label: 'External CoP' },
];

function makeInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function AdminSettings() {
  const role = useRole();
  const taxonomy = useTaxonomy();
  const users = useUsers();

  // Taxonomy state
  const [editingTaxKey, setEditingTaxKey] = useState<keyof Taxonomy | null>(null);
  const [newTaxValue, setNewTaxValue] = useState('');
  const [renamingItem, setRenamingItem] = useState<{ key: keyof Taxonomy; old: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // User state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'viewer' as Role });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<Partial<UserAccount>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">You do not have permission to access this page.</p>
        <Link to="/" className="text-blue-600">Return to sign in</Link>
      </div>
    );
  }

  // Taxonomy handlers
  function handleAddTaxItem(key: keyof Taxonomy) {
    const val = newTaxValue.trim();
    if (!val) return;
    addTaxonomyItem(key, val);
    setNewTaxValue('');
    setEditingTaxKey(null);
  }

  function handleRemoveTaxItem(key: keyof Taxonomy, value: string) {
    removeTaxonomyItem(key, value);
  }

  function handleRenameTaxItem() {
    if (!renamingItem || !renameValue.trim()) return;
    renameTaxonomyItem(renamingItem.key, renamingItem.old, renameValue.trim());
    setRenamingItem(null);
    setRenameValue('');
  }

  // User handlers
  function handleAddUser() {
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    const user: UserAccount = {
      id: 'user-' + Date.now(),
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      initials: makeInitials(newUser.name.trim()),
      status: 'Active',
    };
    addUser(user);
    setNewUser({ name: '', email: '', role: 'viewer' });
    setShowAddUser(false);
  }

  function handleSaveUser(id: string) {
    updateUser(id, editUserData);
    if (editUserData.name) {
      updateUser(id, { initials: makeInitials(editUserData.name) });
    }
    setEditingUserId(null);
    setEditUserData({});
  }

  function handleDeleteUser(id: string) {
    deleteUser(id);
    setConfirmDeleteId(null);
  }

  function handleToggleStatus(user: UserAccount) {
    updateUser(user.id, { status: user.status === 'Active' ? 'Inactive' : 'Active' });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Settings</h1>

      {/* Taxonomy Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Taxonomy Management</h2>
        <div className="space-y-5">
          {(Object.keys(taxonomyLabels) as (keyof Taxonomy)[]).map(key => (
            <div key={key} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">{taxonomyLabels[key]}</h3>
                {editingTaxKey === key ? (
                  <button
                    onClick={() => { setEditingTaxKey(null); setNewTaxValue(''); }}
                    className="text-xs text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => { setEditingTaxKey(key); setNewTaxValue(''); }}
                    className="text-xs text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer"
                  >
                    + Add
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {taxonomy[key].map(v => (
                  <span key={v} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 pl-2.5 pr-1 py-1 rounded text-xs group">
                    {renamingItem && renamingItem.key === key && renamingItem.old === v ? (
                      <span className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRenameTaxItem(); if (e.key === 'Escape') setRenamingItem(null); }}
                          className="border border-gray-300 rounded px-1.5 py-0.5 text-xs w-28"
                          autoFocus
                        />
                        <button onClick={handleRenameTaxItem} className="text-green-600 hover:text-green-800 bg-transparent border-none cursor-pointer text-xs font-bold">✓</button>
                        <button onClick={() => setRenamingItem(null)} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-xs">✕</button>
                      </span>
                    ) : (
                      <>
                        <span
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => { setRenamingItem({ key, old: v }); setRenameValue(v); }}
                          title="Click to rename"
                        >
                          {v}
                        </span>
                        <button
                          onClick={() => handleRemoveTaxItem(key, v)}
                          className="text-gray-400 hover:text-red-600 bg-transparent border-none cursor-pointer text-xs ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove ${v}`}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </span>
                ))}
              </div>
              {editingTaxKey === key && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={newTaxValue}
                    onChange={e => setNewTaxValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddTaxItem(key); }}
                    placeholder={`New ${taxonomyLabels[key].toLowerCase().replace(/s$/, '')}...`}
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-h-[36px]"
                    autoFocus
                  />
                  <button
                    onClick={() => handleAddTaxItem(key)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 min-h-[36px] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">User Management</h2>
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 min-h-[44px] cursor-pointer text-sm"
          >
            {showAddUser ? 'Cancel' : '+ Add User'}
          </button>
        </div>

        {/* Add user form */}
        {showAddUser && (
          <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-3">New User</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Jane Smith"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. jane.smith@fcdo.gov.uk"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value as Role })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[44px] bg-white"
                >
                  {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleAddUser}
                disabled={!newUser.name.trim() || !newUser.email.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 min-h-[44px] cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create User
              </button>
            </div>
          </div>
        )}

        {/* Confirm delete dialog */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Delete User</h3>
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to remove this user? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 min-h-[44px] cursor-pointer bg-white text-sm">Cancel</button>
                <button onClick={() => handleDeleteUser(confirmDeleteId)} className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 min-h-[44px] cursor-pointer text-sm">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* User table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="pb-2 pr-4">User</th>
              <th className="pb-2 pr-4">Role</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-100">
                {editingUserId === u.id ? (
                  <>
                    <td className="py-3 pr-4">
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={editUserData.name ?? u.name}
                          onChange={e => setEditUserData({ ...editUserData, name: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <input
                          type="email"
                          value={editUserData.email ?? u.email}
                          onChange={e => setEditUserData({ ...editUserData, email: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-gray-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={editUserData.role ?? u.role}
                        onChange={e => setEditUserData({ ...editUserData, role: e.target.value as Role })}
                        className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                      >
                        {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={editUserData.status ?? u.status}
                        onChange={e => setEditUserData({ ...editUserData, status: e.target.value as 'Active' | 'Inactive' })}
                        className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleSaveUser(u.id)} className="text-sm text-green-600 hover:text-green-800 bg-transparent border-none cursor-pointer font-medium">Save</button>
                        <button onClick={() => { setEditingUserId(null); setEditUserData({}); }} className="text-sm text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer">Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0">
                          {u.initials}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'viewer' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : u.role === 'viewer' ? 'Viewer' : 'External CoP'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium bg-transparent border-none cursor-pointer ${
                          u.status === 'Active' ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={u.status === 'Active' ? 'Click to deactivate' : 'Click to activate'}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        {u.status}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => { setEditingUserId(u.id); setEditUserData({}); }}
                          className="text-sm text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(u.id)}
                          className="text-sm text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center text-gray-500 py-6 text-sm">No users configured.</p>
        )}
      </div>
    </div>
  );
}
