import React, { useState } from 'react';
import { UserProfile } from '../types';
import { WifiOff, Laptop, Smartphone, AlertTriangle, X, ShieldCheck } from 'lucide-react';

interface SyncStatusBannerProps {
  isOnline: boolean;
  user: UserProfile | null;
  syncError?: string | null;
  onOpenAuthModal: () => void;
}

export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({
  isOnline,
  user,
  syncError,
  onOpenAuthModal,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (!isOnline) {
    return (
      <div 
        id="offline-banner"
        className="bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-950 flex items-center justify-between gap-3 rounded-xl shadow-2xs animate-fade-in"
      >
        <div className="flex items-center gap-2 min-w-0">
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="truncate">
            <strong>Offline Mode:</strong> Tasks are saved locally on this browser.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-amber-100 rounded-lg text-amber-900 shrink-0 cursor-pointer"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (syncError) {
    return (
      <div 
        id="sync-error-banner"
        className="bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl shadow-2xs animate-fade-in"
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-slate-800 leading-snug">
            <strong>Cloud Sync Notice:</strong> Working in local browser storage mode.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={onOpenAuthModal}
            className="text-[11px] font-bold text-amber-900 hover:underline cursor-pointer bg-amber-100 px-2 py-0.5 rounded-md"
          >
            Details
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-amber-200/60 rounded-lg text-slate-600 cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (!user || user.isAnonymous) {
    return (
      <div 
        id="guest-sync-notice"
        className="bg-white px-4 py-2.5 text-xs text-slate-800 flex items-center justify-between gap-3 rounded-xl shadow-2xs animate-fade-in border border-slate-200/80"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="truncate text-slate-700 font-medium">
            Saved on this device. <button onClick={onOpenAuthModal} className="font-bold text-indigo-700 hover:underline underline-offset-2 cursor-pointer">Sign in</button> to sync tasks in real time across devices.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 shrink-0 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
};


