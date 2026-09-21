import React, { useState } from 'react';
import { X, Download, Image as ImageIcon, Copy, Check } from 'lucide-react';

interface AppIconModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function AppIconModal({ isOpen, onClose, darkMode }: AppIconModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const downloadSvgIcon = () => {
    const link = document.createElement('a');
    link.href = '/icon.svg';
    link.download = 'NOTPAD-MCQ-MAKER-icon-bw.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPngIcon = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 512, 512);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = 'NOTPAD-MCQ-MAKER-icon-512x512.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = '/icon.svg';
  };

  const copySvgSource = async () => {
    try {
      const res = await fetch('/icon.svg');
      const svgText = await res.text();
      await navigator.clipboard.writeText(svgText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy SVG:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-base">Black & White App Icon</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Icon Preview */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="w-36 h-36 rounded-3xl shadow-2xl p-1 bg-black flex items-center justify-center border-2 border-white/20">
            <img 
              src="/icon.svg" 
              alt="NOTPAD MCQ MAKER B&W Icon" 
              className="w-full h-full rounded-2xl select-none"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="mt-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            512x512 Google Play Console HD Ready
          </span>
        </div>

        {/* Download & Copy Actions */}
        <div className="mt-5 flex flex-col space-y-2">
          <button
            onClick={downloadPngIcon}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer ${
              darkMode 
                ? 'bg-white text-black hover:bg-slate-100' 
                : 'bg-slate-900 text-white hover:bg-black'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download PNG (512x512)</span>
          </button>

          <button
            onClick={downloadSvgIcon}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition active:scale-95 cursor-pointer border ${
              darkMode 
                ? 'border-slate-700 hover:bg-slate-800 text-white' 
                : 'border-slate-300 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download Vector SVG</span>
          </button>

          <button
            onClick={copySvgSource}
            className={`w-full py-2 px-4 rounded-xl font-medium text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer ${
              darkMode 
                ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied SVG to Clipboard!' : 'Copy Raw SVG Code'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
