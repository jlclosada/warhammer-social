import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LogOut, LayoutGrid, FolderOpen, Plus, User, BookOpen, Sparkles, Compass, Bell, Trophy } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import UserSearch from './UserSearch';
import api from '../services/api';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/feed', icon: Compass, label: 'Explore' },
  { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/collections', icon: FolderOpen, label: 'Collections' },
  { to: '/catalog', icon: BookOpen, label: 'Catalog' },
  { to: '/notifications', icon: Bell, label: 'Notifications', hasBadge: true },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/profile', icon: User, label: 'My Profile' },
];

export default function AppLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread notifications every 30s
  const fetchUnread = useCallback(() => {
    api.get('/collections/social/notifications/unread-count/')
      .then((res) => setUnreadCount(res.data.count || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnread]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="noise-overlay flex min-h-screen bg-surface">
      {/* ── Ambient glow orbs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/[0.03] blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-accent-light/[0.02] blur-[100px]" />
      </div>

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex w-[260px] flex-col border-r border-border bg-surface-primary/50 backdrop-blur-xl relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Sparkles size={16} className="text-accent" />
          </div>
          <div>
            <h1 className="font-display text-[15px] font-bold tracking-[-0.02em] text-text-primary">
              Warhammer
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-tertiary -mt-0.5">Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map(({ to, icon: Icon, label, hasBadge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-all duration-300 ${
                  isActive
                    ? 'bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(108,92,231,0.15)]'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={16} strokeWidth={1.8} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                    {hasBadge && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white shadow-[0_0_6px_rgba(239,68,68,0.4)]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent-glow)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}

          <div className="pt-2 space-y-1">
            <button
              onClick={() => navigate('/collections/new')}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-medium text-accent cursor-pointer transition-all duration-300 hover:bg-accent/10 active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={1.8} />
              New Collection
            </button>
            <UserSearch />
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-hover">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent-light/20 ring-1 ring-accent/10">
              <User size={13} className="text-accent-light" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-text-primary truncate">
                {user?.first_name || user?.username}
              </p>
              <p className="text-[10px] text-text-tertiary truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-text-tertiary cursor-pointer transition-all duration-200 hover:bg-surface-secondary hover:text-danger"
              title="Logout"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-border bg-surface-primary/60 backdrop-blur-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span className="font-display text-[14px] font-bold text-text-primary">Warhammer Portal</span>
        </div>
        <div className="flex items-center gap-1">
          {NAV.map(({ to, icon: Icon, hasBadge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `relative rounded-lg p-2 cursor-pointer transition-all duration-200 ${
                  isActive ? 'bg-accent/10 text-accent' : 'text-text-tertiary hover:text-text-secondary'
                }`
              }
            >
              <Icon size={17} />
              {hasBadge && unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[7px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-text-tertiary cursor-pointer transition-colors hover:text-danger"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 lg:overflow-auto relative z-10">
        <div className="lg:hidden h-14" />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-6xl px-6 py-8 lg:px-10"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}

