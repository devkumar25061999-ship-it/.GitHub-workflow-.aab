import React from 'react';
import { ChevronDown, Trash2, Cloud, CloudOff, Settings2, Download, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentYear: number;
  onOpenYearPicker: () => void;
  onOpenReport: () => void;
  onOpenReset: () => void;
  onOpenSettings: () => void;
  onOpenHowToUse?: () => void;
  isOnline: boolean;
  pendingSync: boolean;
  onInstallPWA?: () => void;
  isInstallable?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentYear,
  onOpenYearPicker,
  onOpenReport,
  onOpenReset,
  onOpenSettings,
  onOpenHowToUse,
  isOnline,
  pendingSync,
  onInstallPWA,
  isInstallable,
}) => {
  return (
    <header
      id="app-header"
      className="bg-[#1e2024] text-white px-4 py-3 flex items-center justify-between shadow-md select-none border-b border-gray-800"
    >
      {/* Left: Year dropdown button matching screenshot */}
      <button
        id="btn-year-selector"
        onClick={onOpenYearPicker}
        className="flex items-center gap-2 bg-[#2a2d33] hover:bg-[#34383f] text-[#facc15] font-bold text-xl px-3.5 py-1.5 rounded-lg border border-gray-700 active:scale-95 transition cursor-pointer"
        aria-label="Select Year"
      >
        <span>{currentYear}</span>
        <ChevronDown className="w-5 h-5 text-[#facc15]" />
      </button>

      {/* Center: Title & Offline indicator */}
      <div className="flex flex-col items-center">
        <span className="font-extrabold text-sm sm:text-base tracking-wide text-gray-100 flex items-center gap-1.5">
          Attendance<span className="text-emerald-400 font-black">+</span>
        </span>
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          {isOnline ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <Cloud className="w-3 h-3" />
              {pendingSync ? 'Syncing...' : 'Offline Ready'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
              <CloudOff className="w-3 h-3" />
              Offline Mode
            </span>
          )}
        </div>
      </div>

      {/* Right Icons: Install (if available), How to Use, Report, Settings/Sync, Trash */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* PWA Install Button in Header */}
        {isInstallable && onInstallPWA && (
          <button
            id="btn-header-install-pwa"
            onClick={onInstallPWA}
            title="Install App on Phone"
            className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Install</span>
          </button>
        )}

        {/* How to Use Guide Button */}
        {onOpenHowToUse && (
          <button
            id="btn-open-how-to-use"
            onClick={onOpenHowToUse}
            title="How to Use Guide"
            className="p-1.5 rounded-md hover:bg-[#2f333a] active:scale-90 transition text-amber-300 hover:text-amber-200 cursor-pointer"
            aria-label="How to Use"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        )}

        {/* Monthly Report / Dashboard button (matches screenshot bar chart icon) */}
        <button
          id="btn-open-report"
          onClick={onOpenReport}
          title="Monthly Report & Dashboard"
          className="p-1.5 rounded-md hover:bg-[#2f333a] active:scale-90 transition text-gray-200 hover:text-white cursor-pointer"
          aria-label="Monthly Report"
        >
          {/* Custom multi-color bar chart icon matching screenshot */}
          <div className="w-6 h-6 flex items-end justify-center gap-0.5 p-0.5">
            <span className="w-1.5 h-3 bg-red-400 rounded-sm"></span>
            <span className="w-1.5 h-4.5 bg-yellow-400 rounded-sm"></span>
            <span className="w-1.5 h-5 bg-sky-400 rounded-sm"></span>
          </div>
        </button>

        {/* Settings & Backup/Sync */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          title="Settings, Backup & AdMob"
          className="p-1.5 rounded-md hover:bg-[#2f333a] active:scale-90 transition text-gray-300 hover:text-white"
          aria-label="Settings"
        >
          <Settings2 className="w-5 h-5" />
        </button>

        {/* Trash / Reset Month or All (matches screenshot trash icon) */}
        <button
          id="btn-open-reset"
          onClick={onOpenReset}
          title="Clear / Reset Attendance"
          className="p-1.5 rounded-md hover:bg-[#2f333a] active:scale-90 transition text-sky-300 hover:text-red-400"
          aria-label="Clear Month"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
