import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const SidebarNav = ({ onStartSession }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'DASHBOARD', path: '/dashboard', icon: 'grid_view' },
    { label: 'INTERVIEWS', path: '/history', icon: 'forum' },
    { label: 'REPORTS', path: '/history', icon: 'analytics' },
    { label: 'SETTINGS', path: '/dashboard', icon: 'settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 border-r-[3px] border-on-surface bg-surface-container-low p-4 space-y-4 shadow-[6px_0px_0px_0px_rgba(0,0,0,1)] sticky top-0 shrink-0 z-20">
      {/* User Info Profile Box */}
      <div className="mb-4">
        <Link to="/" className="font-headline text-xl font-black text-on-surface mb-2 block tracking-tight">
          NEO_INTV
        </Link>
        <div className="flex flex-col gap-2 p-2 border-[3px] border-on-surface bg-background neo-shadow-static mt-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-on-surface bg-primary-container flex items-center justify-center shrink-0 overflow-hidden font-bold">
              <span className="material-symbols-outlined text-2xl text-on-surface">smart_toy</span>
            </div>
            <div className="min-w-0">
              <div className="font-mono text-xs font-bold truncate text-on-surface">
                {user?.name || 'CYBER_PUNK_01'}
              </div>
              <div className="font-mono text-[10px] text-primary font-bold uppercase">
                {user?.tier || 'PREMIUM_TIER'}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t-[2px] border-dashed border-on-surface pt-2 mt-1">
            <span className="font-mono text-[10px] font-bold">TOKENS: {user?.tokenBalance ?? '?'}</span>
            <Link to="/buy-tokens" className="font-mono text-[10px] bg-primary text-on-primary px-2 py-0.5 border border-on-surface hover:bg-primary-container hover:text-on-primary-container font-bold">BUY</Link>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 p-3 font-mono text-sm transition-all duration-75 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container border-[3px] border-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold'
                  : 'text-on-surface-variant hover:bg-surface-variant hover:translate-x-[2px] hover:translate-y-[2px] border-[3px] border-transparent hover:border-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Action / Logout */}
      <div className="mt-auto pt-4 border-t-[3px] border-on-surface">
        <Button
          variant="primary"
          onClick={onStartSession}
          className="w-full py-3 mb-3 font-mono text-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          NEW_INTERVIEW
        </Button>
        <button
          onClick={logout}
          className="flex items-center gap-3 p-3 w-full text-on-surface-variant hover:bg-surface-variant hover:text-secondary font-mono text-sm border-[3px] border-transparent hover:border-on-surface transition-all"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>LOGOUT</span>
        </button>
      </div>
    </aside>
  );
};
