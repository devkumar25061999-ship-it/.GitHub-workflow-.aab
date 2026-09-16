import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div
      id="offline-status-banner"
      className="w-full bg-amber-500 text-amber-950 px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs select-none border-b border-amber-600"
    >
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — All attendance records are saved safely in local storage.</span>
    </div>
  );
};
