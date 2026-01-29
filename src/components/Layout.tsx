import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRole, useCurrentUser } from '../hooks/useStore';
import { logout } from '../store';
import type { Role } from '../types';

const internalViewerNav = [
  { to: '/documents', label: 'Documents' },
  { to: '/ai', label: 'AI Q&A' },
  { to: '/evidence', label: 'Evidence Pages' },
  { to: '/help', label: 'Help' },
];

const internalAdminNav = [
  { to: '/documents', label: 'Documents' },
  { to: '/upload', label: 'Upload & Validate' },
  { to: '/ai', label: 'AI Q&A' },
  { to: '/evidence', label: 'Evidence Pages' },
  { to: '/cop/publishing', label: 'CoP Publishing' },
  { to: '/admin', label: 'Admin Settings' },
];

const externalNav = [
  { to: '/cop/upload', label: 'Upload' },
  { to: '/cop', label: 'CoP Home' },
  { to: '/cop/library', label: 'Learning Library' },
  { to: '/cop/themes', label: 'Thematic Pages' },
  { to: '/cop/events', label: 'Events Calendar' },
  { to: '/cop/about', label: 'About / Access' },
];

function getNav(role: Role) {
  if (role === 'admin') return internalAdminNav;
  if (role === 'external') return externalNav;
  return internalViewerNav;
}

export default function Layout({ children }: { children: ReactNode }) {
  const role = useRole();
  const user = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const nav = getNav(role);

  const isLoginPage = location.pathname === '/';

  function handleSignOut() {
    logout();
    navigate('/');
  }

  if (isLoginPage) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#1e293b] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <Link to={user ? (role === 'external' ? '/cop' : '/documents') : '/'} className="text-lg font-bold tracking-tight hover:text-blue-200 no-underline text-white">
            FGMC2 KMIS
          </Link>
          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {nav.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-2 rounded text-sm font-medium no-underline transition-colors ${
                  location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {user.initials}
                </div>
                <span className="text-sm text-gray-300 hidden sm:inline">{user.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-400 hover:text-white bg-transparent border border-gray-600 rounded px-3 py-1.5 cursor-pointer hover:border-gray-400 min-h-[36px]"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
        <nav className="lg:hidden px-4 pb-3 flex flex-wrap gap-1" role="navigation" aria-label="Mobile navigation">
          {nav.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-2 rounded text-sm font-medium no-underline ${
                location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        FGMC2 Knowledge Management Information System · FCDO
      </footer>
    </div>
  );
}
