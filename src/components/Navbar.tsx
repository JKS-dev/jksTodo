import React from 'react';
import { UserProfile } from '../types';
import { CheckSquare, Wifi, WifiOff, RefreshCw, User as UserIcon, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  isOnline: boolean;
  isSyncing: boolean;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isOnline,
  isSyncing,
  onOpenAuthModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-2xs transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <CheckSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-none truncate">
                TaskFlow
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                Workspace
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate hidden sm:block">
              Task Management &amp; Cloud Sync
            </p>
          </div>
        </div>

        {/* Right Status Badges & User Profile Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Syncing Indicator */}
          {user && isSyncing && (
            <div 
              id="sync-indicator"
              className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/80 animate-fade-in"
              title="Syncing changes with cloud"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span className="hidden sm:inline text-[11px] font-semibold">Syncing</span>
            </div>
          )}

          {/* Network Status Pill */}
          <div
            id="network-status-badge"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                : 'bg-amber-50 text-amber-800 border-amber-200/80'
            }`}
            title={isOnline ? 'Online mode - Realtime updates enabled' : 'Offline mode - Local storage fallback'}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            )}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Account Profile Trigger */}
          <button
            id="account-modal-trigger-btn"
            onClick={onOpenAuthModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              user && !user.isAnonymous
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/80'
            }`}
          >
            {user && !user.isAnonymous ? (
              <>
                <div className="w-5 h-5 rounded-full bg-indigo-800 text-white flex items-center justify-center font-bold text-[10px]">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[80px] sm:max-w-[120px] truncate text-xs font-semibold">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-xs">Account</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


