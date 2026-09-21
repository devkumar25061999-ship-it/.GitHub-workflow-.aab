import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sun, Moon, Languages, Image as ImageIcon } from 'lucide-react';
import { LanguageCode, LANGUAGES, getTranslation } from '../utils/translations';

interface NotepadHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onTitleClick?: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenIconModal: () => void;
}

export default function NotepadHeader({
  searchQuery,
  onSearchChange,
  onTitleClick,
  darkMode,
  onToggleTheme,
  language,
  onLanguageChange,
  onOpenIconModal
}: NotepadHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(searchQuery));
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery) {
      setIsSearchOpen(true);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside to close language menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    if (isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangMenuOpen]);

  const handleToggleSearch = () => {
    if (isSearchOpen) {
      if (searchQuery) {
        onSearchChange('');
      }
      setIsSearchOpen(false);
    } else {
      setIsSearchOpen(true);
    }
  };

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 sm:px-6 md:px-8 pt-[max(env(safe-area-inset-top),12px)] pb-3 transition-colors duration-200 ${
      darkMode 
        ? 'bg-[#0f172a]/95 border-slate-800/90 text-white' 
        : 'bg-[#eef2f6]/95 border-slate-200/90 text-slate-900'
    }`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Left Side: App Icon + App Name */}
        {!isSearchOpen ? (
          <div className="flex items-center space-x-2 shrink-0">
            {/* Black & White App Icon Trigger */}
            <button
              onClick={onOpenIconModal}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-black border border-white/20 shadow-xs flex items-center justify-center p-0.5 hover:scale-105 active:scale-95 transition cursor-pointer shrink-0"
              title="View & Download Black & White App Icon"
              aria-label="App Icon"
            >
              <img 
                src="/icon.svg" 
                alt="App Icon" 
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </button>

            <button
              onClick={onTitleClick}
              className={`font-black text-xs sm:text-sm md:text-base tracking-tight select-none hover:opacity-75 transition cursor-pointer text-left py-1 uppercase whitespace-nowrap ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}
              title="NOTPAD MCQ MAKER Home"
              aria-label="NOTPAD MCQ MAKER Home"
            >
              {getTranslation(language, 'appName')}
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenIconModal}
              className="w-8 h-8 rounded-xl overflow-hidden bg-black border border-white/20 shadow-xs flex items-center justify-center p-0.5 hover:scale-105 active:scale-95 transition cursor-pointer shrink-0"
              title="View & Download Black & White App Icon"
            >
              <img 
                src="/icon.svg" 
                alt="App Icon" 
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </button>

            <button
              onClick={onTitleClick}
              className={`font-black text-xs sm:text-sm md:text-base tracking-tight select-none hover:opacity-75 transition cursor-pointer text-left py-1 uppercase whitespace-nowrap ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}
              title="NOTPAD MCQ MAKER Home"
            >
              {getTranslation(language, 'appName')}
            </button>
          </div>
        )}

        {/* Right Side: Language Selector (Bagal Mein) + Search + Theme Toggle */}
        <div className={`flex items-center space-x-2 justify-end ${isSearchOpen ? 'flex-1' : ''}`}>
          
          {/* Expanded Search Bar */}
          {isSearchOpen && (
            <div className="relative flex-1 max-w-md animate-in fade-in zoom-in-95 duration-150">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={getTranslation(language, 'searchPlaceholder')}
                className={`w-full rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm placeholder-slate-400 focus:outline-none transition ${
                  darkMode 
                    ? 'bg-slate-900/90 text-white focus:bg-slate-850 focus:ring-1.5 focus:ring-slate-400' 
                    : 'bg-white text-slate-900 focus:bg-white focus:ring-1.5 focus:ring-slate-900 border border-slate-200 shadow-xs'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
                  aria-label="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* 🌐 Language Switcher (Hindi / English / Punjabi / Urdu / Sanskrit) */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl flex items-center space-x-1.5 transition cursor-pointer shrink-0 font-bold text-xs ${
                darkMode 
                  ? 'bg-slate-850/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 active:scale-95' 
                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/80 shadow-xs active:scale-95'
              }`}
              title={getTranslation(language, 'changeLanguage')}
              aria-label="Language"
            >
              <Languages className="w-4 h-4 text-sky-500" />
              <span className="uppercase text-[11px] sm:text-xs">
                {language}
              </span>
            </button>

            {/* Language Dropdown Menu */}
            {isLangMenuOpen && (
              <div className={`absolute right-0 top-full mt-1.5 w-44 rounded-2xl p-1.5 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150 ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-lg'
              }`}>
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  Select Language / भाषा
                </div>
                <div className="flex flex-col space-y-0.5 mt-1">
                  {LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        onLanguageChange(item.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer text-left ${
                        language === item.code
                          ? (darkMode ? 'bg-slate-800 text-sky-400 font-bold' : 'bg-slate-100 text-sky-600 font-bold')
                          : (darkMode ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-50 text-slate-700')
                      }`}
                    >
                      <span>{item.nativeName}</span>
                      <span className="text-[10px] uppercase text-slate-400 font-mono">{item.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Icon Button (Next to Language) */}
          <button
            onClick={handleToggleSearch}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
              isSearchOpen
                ? (darkMode ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900')
                : (darkMode 
                    ? 'bg-slate-850/80 hover:bg-slate-800 text-slate-300 hover:text-white active:scale-95 border border-slate-700/60' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 active:scale-95 border border-slate-200/80 shadow-xs')
            }`}
            title={isSearchOpen ? getTranslation(language, 'closeSearch') : getTranslation(language, 'search')}
            aria-label="Search"
          >
            {isSearchOpen ? (
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Theme Toggle Icon Button */}
          <button
            onClick={onToggleTheme}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
              darkMode 
                ? 'bg-slate-850/80 hover:bg-slate-800 text-yellow-300 active:scale-95 border border-slate-700/60' 
                : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 active:scale-95 border border-slate-200/80 shadow-xs'
            }`}
            title={darkMode ? getTranslation(language, 'themeLight') : getTranslation(language, 'themeDark')}
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-300/30" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
