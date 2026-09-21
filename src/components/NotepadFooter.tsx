import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface NotepadFooterProps {
  darkMode: boolean;
}

export default function NotepadFooter({ darkMode }: NotepadFooterProps) {
  return (
    <footer className={`mt-auto border-t px-4 sm:px-6 md:px-8 py-3 transition-colors duration-200 ${
      darkMode 
        ? 'bg-[#0f172a]/95 border-slate-800/90 text-slate-400' 
        : 'bg-[#eef2f6]/95 border-slate-200/90 text-slate-600'
    }`}>
      <div className="max-w-4xl mx-auto flex items-center justify-center space-x-2.5 text-xs">
        <span className={`tracking-tight font-black uppercase text-[11px] sm:text-xs ${
          darkMode ? 'text-slate-200' : 'text-slate-800'
        }`}>
          NOTPAD MCQ MAKER
        </span>
        <span className="text-slate-400">•</span>
        <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Offline Ready</span>
        </div>
      </div>
    </footer>
  );
}
