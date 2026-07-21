import React from 'react';
import { UserProfile } from '../types';
import { WifiOff, RefreshCw, Smartphone, Laptop, CheckCircle2 } from 'lucide-react';

interface SyncStatusBannerProps {
  isOnline: boolean;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
}

export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({
  isOnline,
  user,
  onOpenAuthModal,
}) => {
  if (!isOnline) {
    return (
      <div 
        id="offline-banner"
        className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-2 max-w-4xl mx-auto rounded-xl mt-3 mx-4 sm:mx-auto"
      >
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Offline Mode Active:</strong> All changes are stored safely in browser storage and will automatically sync once reconnected.
          </span>
        </div>
      </div>
    );
  }

  if (!user || user.isAnonymous) {
    return (
      <div 
        id="guest-sync-notice"
        className="bg-stone-100/90 border border-stone-200/80 px-4 py-2.5 text-xs text-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl mt-4 max-w-4xl mx-4 sm:mx-auto"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-stone-500">
            <Laptop className="w-4 h-4" />
            <Smartphone className="w-4 h-4" />
          </div>
          <span>
            <strong>Guest Session:</strong> Tasks are currently saved on this device. Sign in to seamlessly sync across your phone, tablet, and computer.
          </span>
        </div>
        <button
          id="banner-login-btn"
          onClick={onOpenAuthModal}
          className="shrink-0 text-xs font-semibold text-stone-900 hover:text-stone-700 underline underline-offset-2"
        >
          Enable Device Sync →
        </button>
      </div>
    );
  }

  return (
    <div 
      id="cloud-synced-notice"
      className="bg-emerald-500/5 border border-emerald-500/15 px-4 py-2 text-xs text-emerald-900 flex items-center justify-between gap-2 rounded-xl mt-4 max-w-4xl mx-4 sm:mx-auto"
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Synced with Cloud:</strong> Signed in as <span className="font-semibold">{user.email || user.displayName}</span>. Your tasks sync in real-time across all signed-in devices.
        </span>
      </div>
    </div>
  );
};
