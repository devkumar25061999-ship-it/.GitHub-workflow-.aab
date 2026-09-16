import React, { useState } from 'react';
import { Info, Sparkles, ExternalLink } from 'lucide-react';

interface AdMobBannerProps {
  admobBannerId?: string;
  testMode?: boolean;
  onOpenPrivacy?: () => void;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  admobBannerId = 'ca-app-pub-3940256099942544/6300978111', // Google official test banner unit ID
  testMode = true,
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
        <div className="flex items-center gap-1">
          <span className="bg-gray-300 text-gray-700 font-bold px-1 rounded-[3px] text-[9px] uppercase tracking-wider">
            Ad
          </span>
          <span className="text-[10px] text-gray-600 font-medium">Google AdMob</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPrivacy && (
            <button
              onClick={onOpenPrivacy}
              className="text-[10px] text-gray-600 hover:text-gray-900 underline cursor-pointer"
            >
              Ad Privacy
            </button>
          )}
          <button
            onClick={() => setShowTooltip((prev) => !prev)}
            className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
            title="AdMob Info"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Tooltip on tap */}
      {showTooltip && (
        <div className="w-full max-w-[320px] p-2 mb-1 bg-gray-900 text-white rounded-lg text-[11px] shadow-lg animate-in fade-in flex flex-col gap-1 z-10">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AdMob Live Ad Slot
            </span>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-200">
            {testMode
              ? 'Currently in Test Mode with Google Test ID. Once approved on Play Store, live ads will start displaying automatically!'
              : `Active Ad Unit ID: ${admobBannerId}`}
          </p>
          <span className="text-[10px] text-gray-400">
            Ad unit can be changed anytime in Settings &gt; AdMob Setup.
          </span>
        </div>
      )}

      {/* Official 320x50 Standard Mobile Banner Box */}
      <div
        id="admob-ad-unit-box"
        className="w-[320px] h-[50px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-md shadow-xs border border-slate-700/80 flex items-center justify-between px-3 relative overflow-hidden"
      >
        {/* Subtle decorative banner badge */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/10 rounded-full blur-sm pointer-events-none" />

        <div className="flex items-center gap-2.5 z-0">
          {/* Ad Icon */}
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-slate-950 text-xs shadow-xs shrink-0">
            Ad
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white tracking-tight leading-tight flex items-center gap-1">
              Google AdMob Partner
              {testMode && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-1 rounded font-normal">
                  Test Mode
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-300 leading-tight truncate max-w-[155px]">
              Ready for Play Store monetization
            </span>
          </div>
        </div>

        {/* Action button */}
        <a
          href="https://admob.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded flex items-center gap-1 shadow-xs transition active:scale-95 shrink-0 z-0"
        >
          <span>Learn</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};
