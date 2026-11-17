import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useBlog } from '../hooks/useBlog.js';

const link = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-ink text-white' : 'text-ink hover:bg-ink/10'}`;

export function Logo({ className = '' }) {
  return (
    <span className={`font-extrabold tracking-tight ${className}`}>
      <span className="hl px-0.5">Write</span>Nova
    </span>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { toast, reset } = useBlog();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-ink/15 bg-desk/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
          <NavLink to="/" className="text-xl"><Logo /></NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={link}>My blogs</NavLink>
            <NavLink to="/studio" className={link} onClick={reset}>Write</NavLink>
            <NavLink to="/account" className={link}>Account</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate sm:inline">{user.name}</span>
            <button className="btn-ghost !px-3 !py-2" onClick={async () => { await logout(); navigate('/login'); }}>
              <LogOut size={16} aria-hidden /> Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><Outlet /></main>
      {toast && (
        <div role="status" key={toast.key}
          className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-3 text-sm font-semibold shadow-lg ${toast.type === 'error' ? 'bg-redpen text-white' : 'bg-ink text-white'}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
