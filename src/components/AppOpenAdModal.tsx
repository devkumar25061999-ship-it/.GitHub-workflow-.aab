import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface AppOpenAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adUnitId?: string;
  testMode?: boolean;
  title?: string;
  onOpenPrivacy?: () => void;
}

export const AppOpenAdModal: React.FC<AppOpenAdModalProps> = ({
  isOpen,
  onClose,
  adUnitId = 'ca-app-pub-3940256099942544/9257395921',
  testMode = true,
  title = 'App Open Ad',
  onOpenPrivacy,
}) => {
  const [countdown, setCountdown] = useState<number>(3);
  const [canClose, setCanClose] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    setCountdown(3);
    setCanClose(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="app-open-ad-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in duration-200"
    >
      {/* Top Bar - Official Google AdMob Standards */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between text-white pt-2 px-1">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded tracking-wider uppercase">
            Ad
          </span>
          <span className="text-xs font-semibold text-gray-300">Google AdMob</span>
          {testMode && (
            <span className="bg-blue-600/30 text-blue-300 text-[10px] px-1.5 py-0.5 rounded border border-blue-400/30">
              Test Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {canClose ? (
            <button
              onClick={onClose}
              className="px-3 py-1 bg-white text-slate-900 hover:bg-gray-200 font-bold text-xs rounded-full flex items-center gap-1 shadow-lg transition active:scale-95 cursor-pointer"
              id="btn-close-app-open-ad"
            >
              <span>Skip</span>
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="px-2.5 py-1 bg-white/15 text-gray-300 font-mono text-xs rounded-full border border-white/10">
              Skip in {countdown}s
            </div>
          )}
        </div>
      </div>

      {/* Main Full-Screen Ad Creative Canvas */}
      <div className="w-full max-w-md mx-auto my-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Ad Visual Media Banner */}
        <div className="relative h-60 sm:h-72 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden border-b border-slate-800">
          {/* Ambient Glows */}
          <div className="absolute -top-16 -left-16 w-44 h-44 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Ad Brand / App Creative Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-xl mb-4 relative z-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/40 rounded-2xl flex items-center justify-center backdrop-blur-xs">
              <Sparkles className="w-8 h-8 text-amber-300" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight relative z-0 leading-snug">
            Google Play Verified App
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xs mt-2 relative z-0">
            Attendance Plus is optimized with fast offline synchronization and high-performance wage calculations.
          </p>

          <div className="mt-4 flex items-center gap-2 relative z-0">
            <div className="flex text-amber-400 text-xs">
              {'★★★★★'}
            </div>
            <span className="text-[11px] text-gray-400">4.9 • Productivity</span>
          </div>
        </div>

        {/* Ad Details & Call-to-Action */}
        <div className="p-4 sm:p-5 flex flex-col gap-3 bg-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-wide">
                Google AdMob Network
              </span>
              <span className="text-[11px] text-gray-400 font-mono truncate max-w-[220px]">
                Unit: {adUnitId}
              </span>
            </div>

            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Install Ready
            </span>
          </div>

          {/* Action CTA Button */}
          <a
            href="https://play.google.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            <span>Explore on Google Play</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <p className="text-[10px] text-center text-gray-500">
            Sponsored advertisement. By clicking you will visit Google partner store.
          </p>
        </div>
      </div>

      {/* Bottom Legal & Privacy Footer */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between text-gray-400 text-[11px] px-2 pb-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Play Ad Policies</span>
        </div>

        <div className="flex items-center gap-3">
          {onOpenPrivacy && (
            <button
              onClick={() => {
                onClose();
                onOpenPrivacy();
              }}
              className="text-gray-400 hover:text-white underline cursor-pointer"
            >
              Privacy Policy
            </button>
          )}

          {canClose ? (
            <button
              onClick={onClose}
              className="text-white hover:text-amber-300 font-bold underline cursor-pointer"
            >
              Continue to App →
            </button>
          ) : (
            <span className="text-gray-500">Wait {countdown}s</span>
          )}
        </div>
      </div>
    </div>
  );
};
