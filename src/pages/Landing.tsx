import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, userAccounts } from '../store';
import type { Role } from '../types';

const roleDescriptions: Record<Role, string> = {
  admin: 'PMSST Admin',
  viewer: 'FCDO / PMSST Staff',
  external: 'CoP Member',
};

export default function Landing() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select a user account.');
      return;
    }
    const user = userAccounts.find(u => u.id === selectedId);
    if (!user) return;
    login(user.id);
    setError('');
    navigate(user.role === 'external' ? '/cop' : '/documents');
  }

  const selectedUser = userAccounts.find(u => u.id === selectedId);

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
          <span className="text-2xl font-bold text-white">KM</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">FGMC2 KMIS</h1>
        <p className="text-gray-500 text-sm">Knowledge Management Information System</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sign In</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="user-account" className="block text-sm font-medium text-gray-700 mb-1">User Account</label>
            <select
              id="user-account"
              value={selectedId}
              onChange={e => { setSelectedId(e.target.value); setError(''); setPassword(''); }}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm min-h-[44px] bg-white"
            >
              <option value="">Select account...</option>
              {userAccounts.map(u => (
                <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-100 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {selectedUser.initials}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedUser.name}</div>
                  <div className="text-gray-500 text-xs">{roleDescriptions[selectedUser.role]} · {selectedUser.email}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter any password"
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 min-h-[44px] cursor-pointer text-sm"
          >
            Sign In
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        FGMC2 Knowledge Management Information System · FCDO
      </p>
    </div>
  );
}
