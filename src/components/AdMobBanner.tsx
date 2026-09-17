import React, { useState } from 'react';
import { Info, Sparkles, ExternalLink } from 'lucide-react';

interface AdMobBannerProps {
  admobBannerId?: string;
  testMode?: boolean;
  onOpenPrivacy?: () => void;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  admobBannerId = 'ca-app-pub-2133508635089094/7668217896',
  testMode = false,
  onOpenPrivacy,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      id="admob-banner-container"
      className="w-full max-w-lg mx-auto px-2 py-1 flex flex-col items-center select-none"
    >
      {/* Google Play Policy required Ad label & info bar */}
      <div className="w-full max-w-[320px] flex items-center justify-between text-[10px] text-gray-500 mb-0.5 px-1">
        <div className="flex items-center gap-1.5">
          <span className="bg-gray-300 text-gray-700 font-bold px-1 rounded-[3px] text-[9px] uppercase tracking-wider">
            Ad
          </span>
          <span className="text-[10px] text-gray-500 font-medium">Google AdMob</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPrivacy && (
            <button
              onClick={onOpenPrivacy}
              className="text-[10px] text-gray-500 hover:text-gray-800 underline cursor-pointer"
            >
              Privacy
            </button>
          )}
          <button
            onClick={() => setShowTooltip((prev) => !prev)}
            className="text-gray-400 hover:text-gray-700 transition cursor-pointer"
            title="Ad Info"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Tooltip on tap */}
      {showTooltip && (
        <div className="w-full max-w-[320px] p-2.5 mb-1 bg-gray-900 text-white rounded-lg text-[11px] shadow-lg animate-in fade-in flex flex-col gap-1 z-10">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Google AdMob Banner
            </span>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-300 text-[10px] leading-relaxed">
            Standard 320x50 Mobile Leaderboard Ad. Powered by Google AdMob network.
          </p>
        </div>
      )}

      {/* Official 320x50 Standard Mobile Banner Box */}
      <div
        id="admob-ad-unit-box"
        className="w-[320px] h-[50px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-md shadow-xs border border-slate-700/80 flex items-center justify-between px-3 relative overflow-hidden"
      >
        {/* Subtle decorative banner glow */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/10 rounded-full blur-sm pointer-events-none" />

        <div className="flex items-center gap-2.5 z-0">
          {/* Ad Sponsor Icon */}
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0">
            G
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white tracking-tight leading-tight flex items-center gap-1">
              Google Workspace
            </span>
            <span className="text-[10px] text-slate-300 leading-tight truncate max-w-[170px]">
              Cloud tools & security for teams
            </span>
          </div>
        </div>

        {/* Call to action button */}
        <a
          href="https://workspace.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 shadow-xs transition active:scale-95 shrink-0 z-0"
        >
          <span>Open</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};
