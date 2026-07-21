import React, { useState } from 'react';
import { UserProfile } from '../types';
import { WifiOff, Laptop, Smartphone, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

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
        className="bg-amber-100 border border-amber-300 px-3.5 py-2.5 text-xs text-amber-950 flex items-center justify-between gap-3 rounded-xl transition-all"
      >
        <div className="flex items-center gap-2 min-w-0">
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="truncate">
            <strong>Offline Mode:</strong> Tasks saved locally in browser storage.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-amber-200 rounded-lg text-amber-900 shrink-0 cursor-pointer"
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
        className="bg-amber-50 border border-amber-300 px-3.5 py-2 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl transition-all"
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="text-slate-800 leading-snug">
            <strong>Cloud Sync Notice:</strong> Working in local storage mode.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={onOpenAuthModal}
            className="text-[11px] font-semibold text-amber-950 hover:underline cursor-pointer"
          >
            Details
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-amber-200 rounded-lg text-slate-600 cursor-pointer"
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
        className="bg-indigo-50 border border-indigo-200 px-3.5 py-2.5 text-xs text-slate-800 flex items-center justify-between gap-3 rounded-xl transition-all"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1 text-indigo-600 shrink-0">
            <Laptop className="w-3.5 h-3.5" />
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <span className="truncate text-slate-700">
            Saved on this device. <button onClick={onOpenAuthModal} className="font-bold text-indigo-700 hover:underline underline-offset-2 cursor-pointer">Sign in</button> to sync across devices.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-indigo-100 rounded-lg text-indigo-700 shrink-0 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
};

