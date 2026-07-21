import React from 'react';
import { UserProfile } from '../types';
import { CheckSquare, Wifi, WifiOff, RefreshCw, User as UserIcon, ShieldCheck } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-3xl mx-auto px-3.5 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <CheckSquare className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-none truncate">
              TaskFlow
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate hidden sm:block">
              Smart Tasks &amp; Cloud Sync
            </p>
          </div>
        </div>

        {/* Status Indicators & Account Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Syncing Indicator */}
          {user && isSyncing && (
            <div 
              id="sync-indicator"
              className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-2 sm:px-2.5 py-1 rounded-full border border-indigo-200/80"
              title="Syncing changes"
            >
              <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-indigo-600" />
              <span className="hidden sm:inline text-[11px] font-semibold">Syncing</span>
            </div>
          )}

          {/* Network Status Badge */}
          <div
            id="network-status-badge"
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold border transition-all ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                : 'bg-amber-50 text-amber-800 border-amber-200/80'
            }`}
            title={isOnline ? 'Connected' : 'Offline'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-600" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-600" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Account Management Trigger */}
          <button
            id="account-modal-trigger-btn"
            onClick={onOpenAuthModal}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              user && !user.isAnonymous
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/90'
            }`}
          >
            {user && !user.isAnonymous ? (
              <>
                <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-indigo-800 text-white flex items-center justify-center font-bold text-[9px] sm:text-[10px]">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[70px] sm:max-w-[120px] truncate text-[11px] sm:text-xs">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[11px] sm:text-xs">Account</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

