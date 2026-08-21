import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const TopHeader = ({ onStartSession }) => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="w-full border-b-[3px] border-on-surface shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-background z-50 sticky top-0">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-full">
        <div className="flex items-center gap-8 md:gap-12">
          <Link
            to="/"
            className="font-headline text-2xl md:text-3xl font-black tracking-tighter text-on-surface uppercase hover:text-primary transition-colors"
          >
            NEO_INTV
          </Link>
          <nav className="hidden md:flex gap-6 font-mono text-sm">
            <Link
              to="/dashboard"
              className={`font-bold transition-all ${
                location.pathname === '/dashboard'
                  ? 'text-primary border-b-[3px] border-primary pb-1'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-primary-container px-2 py-1'
              }`}
            >
              DASHBOARD
            </Link>
            <Link
              to="/history"
              className={`font-bold transition-all ${
                location.pathname === '/history'
                  ? 'text-primary border-b-[3px] border-primary pb-1'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-primary-container px-2 py-1'
              }`}
            >
              HISTORY
            </Link>
            <a
              href="#squad"
              className="text-on-surface-variant font-medium hover:bg-primary-container hover:text-on-surface px-2 py-1 transition-all"
            >
              AGENTS
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={logout}
                className="hidden md:block font-mono text-sm text-on-surface-variant hover:text-secondary px-3 py-1.5 transition-colors"
              >
                LOGOUT
              </button>
              <Button
                variant="primary"
                onClick={onStartSession}
                className="px-6 py-2"
              >
                START_SESSION
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden md:block font-mono text-sm font-bold text-on-surface-variant hover:bg-primary-container hover:text-on-surface px-4 py-2 border-[3px] border-transparent hover:border-on-surface transition-all"
              >
                LOGIN
              </Link>
              <Button
                variant="primary"
                onClick={onStartSession}
                className="px-6 py-2"
              >
                START_SESSION
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
