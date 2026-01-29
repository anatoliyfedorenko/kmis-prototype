import { useState } from 'react';
import { useRole, useTaxonomy, useUsers, useAISettings } from '../hooks/useStore';
import { addTaxonomyItem, removeTaxonomyItem, renameTaxonomyItem, addUser, updateUser, deleteUser, updateAISettings } from '../store';
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
  const aiSettings = useAISettings();

  // AI settings state
  const [showKey, setShowKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

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

      {/* AI Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">AI Configuration</h2>
            <p className="text-sm text-gray-500 mt-0.5">Configure the AI engine for the Q&A feature.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              aiSettings.openRouterKey ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              <span className={`inline-block w-2 h-2 rounded-full ${aiSettings.openRouterKey ? 'bg-green-500' : 'bg-yellow-500'}`} />
              {aiSettings.openRouterKey ? 'Configured' : 'Not configured'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OpenRouter API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={aiSettings.openRouterKey}
                  onChange={e => { updateAISettings({ openRouterKey: e.target.value }); setTestResult(null); }}
                  placeholder="sk-or-v1-..."
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm min-h-[44px] pr-20 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <button
                onClick={async () => {
                  if (!aiSettings.openRouterKey) { setTestResult({ ok: false, message: 'Enter an API key first.' }); return; }
                  setTestingKey(true);
                  setTestResult(null);
                  try {
                    const res = await fetch('https://openrouter.ai/api/v1/models', {
                      headers: { 'Authorization': `Bearer ${aiSettings.openRouterKey}` },
                    });
                    if (res.ok) {
                      setTestResult({ ok: true, message: 'Connection successful. API key is valid.' });
                    } else {
                      setTestResult({ ok: false, message: `Invalid key (HTTP ${res.status}).` });
                    }
                  } catch (err) {
                    setTestResult({ ok: false, message: 'Connection failed. Check your network.' });
                  }
                  setTestingKey(false);
                }}
                disabled={testingKey || !aiSettings.openRouterKey}
                className="px-4 py-2.5 border border-gray-300 rounded font-medium hover:bg-gray-50 min-h-[44px] cursor-pointer bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {testingKey ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            {testResult && (
              <p className={`text-xs mt-1.5 ${testResult.ok ? 'text-green-600' : 'text-red-600'}`}>
                {testResult.message}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1.5">
              Get your key at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">openrouter.ai/keys</a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <select
              value={aiSettings.model}
              onChange={e => updateAISettings({ model: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm min-h-[44px] bg-white"
            >
              <optgroup label="Anthropic">
                <option value="anthropic/claude-sonnet-4">Claude Sonnet 4</option>
                <option value="anthropic/claude-opus-4">Claude Opus 4</option>
                <option value="anthropic/claude-haiku-3.5">Claude 3.5 Haiku</option>
              </optgroup>
              <optgroup label="OpenAI">
                <option value="openai/gpt-4o">GPT-4o</option>
                <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                <option value="openai/o3-mini">o3-mini</option>
              </optgroup>
              <optgroup label="Google">
                <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
                <option value="google/gemini-2.5-pro-preview">Gemini 2.5 Pro</option>
              </optgroup>
              <optgroup label="Meta">
                <option value="meta-llama/llama-4-maverick">Llama 4 Maverick</option>
                <option value="meta-llama/llama-4-scout">Llama 4 Scout</option>
              </optgroup>
              <optgroup label="DeepSeek">
                <option value="deepseek/deepseek-chat-v3-0324">DeepSeek V3</option>
                <option value="deepseek/deepseek-r1">DeepSeek R1</option>
              </optgroup>
            </select>
            <p className="text-xs text-gray-400 mt-1">Routed through OpenRouter. Costs depend on the selected model.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
            <textarea
              value={aiSettings.systemPrompt}
              onChange={e => updateAISettings({ systemPrompt: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
              placeholder="Instructions for the AI model..."
            />
            <p className="text-xs text-gray-400 mt-1">Defines how the AI responds to questions. Customise to fit your programme's context.</p>
          </div>
        </div>
      </div>

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
                  placeholder="e.g. jane.smith@example.org"
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
