import React from 'react';
import { UserProfile } from '../types';
import { CheckSquare, Wifi, WifiOff, RefreshCw, User as UserIcon, Shield, Laptop } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-900 text-stone-50 flex items-center justify-center shadow-sm">
            <CheckSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-stone-900 tracking-tight leading-none">
              Todo List
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Minimalist &amp; Offline Sync
            </p>
          </div>
        </div>

        {/* Status Indicators & Account Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Syncing Indicator */}
          {user && isSyncing && (
            <div 
              id="sync-indicator"
              className="flex items-center gap-1.5 text-xs text-stone-500 bg-stone-100/80 px-2.5 py-1 rounded-full border border-stone-200/60"
              title="Syncing changes with cloud"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span className="hidden sm:inline font-medium">Syncing</span>
            </div>
          )}

          {/* Network Status Badge */}
          <div
            id="network-status-badge"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/70'
                : 'bg-amber-50 text-amber-800 border-amber-200/70'
            }`}
            title={isOnline ? 'Connected to internet' : 'Working offline locally'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Account Management Trigger */}
          <button
            id="account-modal-trigger-btn"
            onClick={onOpenAuthModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              user && !user.isAnonymous
                ? 'bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/80'
            }`}
          >
            {user && !user.isAnonymous ? (
              <>
                <div className="w-5 h-5 rounded-full bg-stone-700 text-stone-200 flex items-center justify-center font-bold text-[10px]">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[100px] sm:max-w-[140px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="w-4 h-4 text-stone-600" />
                <span>Account Sync</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
