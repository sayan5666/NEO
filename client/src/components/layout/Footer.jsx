import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="flex flex-col md:flex-row justify-between items-center w-full px-6 md:px-12 py-8 bg-on-surface text-surface-container-lowest border-t-[3px] border-on-surface gap-4">
      <div className="font-mono text-sm font-bold text-primary-fixed uppercase tracking-wider">
        NEO_INTV // ©2024 DIGITAL_PUNK_AI_SYSTEMS
      </div>
      <div className="flex gap-6 font-mono text-xs">
        <Link to="/" className="text-surface-variant opacity-80 hover:text-primary-fixed hover:opacity-100 transition-opacity">
          PRIVACY
        </Link>
        <Link to="/dashboard" className="text-surface-variant opacity-80 hover:text-primary-fixed hover:opacity-100 transition-opacity">
          TERMINAL
        </Link>
        <div className="text-surface-variant opacity-80 hover:text-primary-fixed hover:opacity-100 transition-opacity flex items-center gap-1.5 cursor-default">
          <span className="w-2 h-2 bg-primary-fixed inline-block"></span>
          SYSTEM_ACTIVE
        </div>
      </div>
    </footer>
  );
};
