import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="hidden sm:inline">Online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline</span>
      <span className="text-amber-600/70 dark:text-amber-400/70 text-[11px] hidden md:inline">· Cached data</span>
    </div>
  );
};

export const OfflineBanner: React.FC<{ cachedAt?: string }> = ({ cachedAt }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="w-full bg-amber-500 text-slate-950 px-4 py-2 text-xs font-medium flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <Database className="w-4 h-4 shrink-0" />
        <span>
          Offline Mode — Showing local cached observations
          {cachedAt ? ` (Snapshot: ${new Date(cachedAt).toLocaleDateString()})` : ''}.
        </span>
      </div>
    </div>
  );
};
