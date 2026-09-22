import React, { useRef, useEffect, useState } from 'react';
import { Note } from '../types';
import { 
  ArrowLeft, 
  Trash2, 
  Pin, 
  Download,
  Bold, 
  Italic, 
  Underline, 
  Type, 
  Palette, 
  Highlighter, 
  RotateCcw,
  Languages
} from 'lucide-react';
import { downloadNoteAsPdf } from '../utils/pdfExport';
import { LanguageCode, getTranslation, offlineTransliterate } from '../utils/translations';

interface NotepadEditorProps {
  note: Note;
  darkMode?: boolean;
  language?: LanguageCode;
  onUpdateNote: (updated: Note) => void;
  onBack: () => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const TEXT_COLORS_LIGHT = [
  { name: 'Default Black', value: '#000000', bg: 'bg-black' },
  { name: 'Dark Gray', value: '#4b5563', bg: 'bg-gray-600' },
  { name: 'Crimson Red', value: '#dc2626', bg: 'bg-red-600' },
  { name: 'Royal Blue', value: '#2563eb', bg: 'bg-blue-600' },
  { name: 'Emerald Green', value: '#16a34a', bg: 'bg-green-600' },
  { name: 'Purple', value: '#9333ea', bg: 'bg-purple-600' },
  { name: 'Amber Orange', value: '#ea580c', bg: 'bg-orange-600' }
];

const TEXT_COLORS_DARK = [
  { name: 'Pure White', value: '#ffffff', bg: 'bg-white' },
  { name: 'Light Gray', value: '#d1d5db', bg: 'bg-gray-300' },
  { name: 'Bright Red', value: '#f87171', bg: 'bg-red-400' },
  { name: 'Sky Blue', value: '#60a5fa', bg: 'bg-blue-400' },
  { name: 'Mint Green', value: '#4ade80', bg: 'bg-green-400' },
  { name: 'Light Purple', value: '#c084fc', bg: 'bg-purple-400' },
  { name: 'Yellow', value: '#fde047', bg: 'bg-yellow-300' }
];

const HIGHLIGHT_COLORS = [
  { name: 'None', value: 'transparent', bg: 'bg-transparent border border-neutral-400' },
  { name: 'Yellow', value: '#fef08a', bg: 'bg-yellow-200 text-black' },
  { name: 'Green', value: '#bbf7d0', bg: 'bg-green-200 text-black' },
  { name: 'Blue', value: '#bfdbfe', bg: 'bg-blue-200 text-black' },
  { name: 'Pink', value: '#fbcfe8', bg: 'bg-pink-200 text-black' },
  { name: 'Purple', value: '#e9d5ff', bg: 'bg-purple-200 text-black' }
];

const FONT_SIZES = [
  { name: 'Small', sizeVal: '2', px: '13px' },
  { name: 'Normal', sizeVal: '3', px: '16px' },
  { name: 'Large', sizeVal: '5', px: '20px' },
  { name: 'Heading', sizeVal: '6', px: '24px' }
];

export default function NotepadEditor({
  note,
  darkMode = false,
  language = 'hi',
  onUpdateNote,
  onBack,
  onDeleteNote,
  onTogglePin
}: NotepadEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const currentContent = (editorRef.current && editorRef.current.innerHTML) ? editorRef.current.innerHTML : note.content;
      await downloadNoteAsPdf(note.title, currentContent, note.updatedAt);
    } catch (err) {
      console.error('[PDF Download Error]', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Sync initial content to contentEditable
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== note.content) {
      editorRef.current.innerHTML = note.content || '';
    }
  }, [note.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNote({
      ...note,
      title: e.target.value,
      updatedAt: new Date().toISOString()
    });
  };

  const handleInput = () => {
    if (editorRef.current) {
      onUpdateNote({
        ...note,
        content: editorRef.current.innerHTML,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleSetColor = (color: string) => {
    executeCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const handleSetHighlight = (color: string) => {
    executeCommand('hiliteColor', color);
    setShowHighlightPicker(false);
  };

  const handleSetSize = (sizeVal: string) => {
    executeCommand('fontSize', sizeVal);
    setShowSizePicker(false);
  };

  const handleClearFormatting = () => {
    executeCommand('removeFormat');
  };

  // 100% Offline Script Transliterate Content for Active Language
  const handleOfflineTranslateNote = () => {
    if (language === 'hi' || language === 'en') return;
    
    // Transliterate title and content offline
    const convertedTitle = offlineTransliterate(note.title, language);
    let convertedContent = note.content;
    if (editorRef.current) {
      const currentText = editorRef.current.innerText;
      const transliteratedText = offlineTransliterate(currentText, language);
      editorRef.current.innerText = transliteratedText;
      convertedContent = editorRef.current.innerHTML;
    }
    
    onUpdateNote({
      ...note,
      title: convertedTitle,
      content: convertedContent,
      updatedAt: new Date().toISOString()
    });
  };

  // Compute words and chars by stripping HTML
  const rawText = note.content ? note.content.replace(/<[^>]+>/g, ' ').trim() : '';
  const words = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  const chars = rawText.length;

  const currentColors = darkMode ? TEXT_COLORS_DARK : TEXT_COLORS_LIGHT;

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-8 md:px-12 safe-bottom-pad">
      
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between pb-3 sm:pb-4 mb-3 border-b ${
        darkMode ? 'border-neutral-800' : 'border-neutral-100'
      }`}>
        <button
          onClick={onBack}
          className={`min-h-[44px] -ml-2 px-3 rounded-lg flex items-center space-x-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
            darkMode 
              ? 'text-neutral-300 hover:text-white hover:bg-neutral-800 active:bg-neutral-700' 
              : 'text-neutral-700 hover:text-black hover:bg-neutral-100 active:bg-neutral-200'
          }`}
          title={getTranslation(language, 'back')}
          aria-label={getTranslation(language, 'back')}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{getTranslation(language, 'allSavedNotes')}</span>
        </button>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Download PDF Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`min-h-[38px] px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed ${
              darkMode 
                ? 'bg-neutral-800 hover:bg-neutral-750 text-white border border-neutral-700' 
                : 'bg-black hover:bg-neutral-800 text-white'
            }`}
            title={isDownloading ? getTranslation(language, 'downloading') : getTranslation(language, 'downloadPdf')}
            aria-label="Download Note as PDF"
          >
            <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline sm:inline">{isDownloading ? getTranslation(language, 'downloading') : 'PDF'}</span>
          </button>

          {/* Pin Toggle Button */}
          <button
            onClick={() => onTogglePin(note.id)}
            className={`min-h-[38px] px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              note.isPinned 
                ? (darkMode ? 'bg-white text-black font-bold' : 'bg-black text-white font-bold')
                : (darkMode ? 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700' : 'bg-neutral-100 text-neutral-700 hover:text-black hover:bg-neutral-200')
            }`}
            title={note.isPinned ? getTranslation(language, 'unpin') : getTranslation(language, 'pin')}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? (darkMode ? 'fill-black' : 'fill-white') : ''}`} />
            <span>{note.isPinned ? getTranslation(language, 'pinnedLabel') : getTranslation(language, 'pin')}</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => {
              if (window.confirm(getTranslation(language, 'deleteConfirmNote'))) {
                onDeleteNote(note.id);
              }
            }}
            className={`min-h-[38px] min-w-[38px] p-2 rounded-lg transition cursor-pointer flex items-center justify-center ${
              darkMode 
                ? 'hover:bg-neutral-800 text-neutral-400 hover:text-red-400' 
                : 'hover:bg-neutral-100 text-neutral-400 hover:text-red-600 active:bg-red-50'
            }`}
            title={getTranslation(language, 'deleteNote')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title Input */}
      <input
        type="text"
        value={note.title}
        onChange={handleTitleChange}
        placeholder={getTranslation(language, 'noteTitlePlaceholder')}
        className={`w-full bg-transparent font-black text-2xl sm:text-3xl md:text-4xl focus:outline-none tracking-tight pb-3 ${
          darkMode ? 'text-white placeholder-neutral-600' : 'text-black placeholder-neutral-300'
        }`}
        autoFocus
      />

      {/* Rich Text Formatting Toolbar */}
      <div className={`sticky top-[58px] z-20 py-2 border-y mb-3 flex items-center flex-wrap gap-1.5 sm:gap-2 backdrop-blur-md ${
        darkMode ? 'bg-neutral-950/95 border-neutral-800' : 'bg-white/95 border-neutral-200'
      }`}>
        
        {/* Bold Button */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('bold');
          }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center font-black transition cursor-pointer ${
            darkMode ? 'hover:bg-neutral-800 text-white' : 'hover:bg-neutral-100 text-black'
          }`}
          title={getTranslation(language, 'bold')}
        >
          <Bold className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Italic Button */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('italic');
          }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center italic font-serif transition cursor-pointer ${
            darkMode ? 'hover:bg-neutral-800 text-white' : 'hover:bg-neutral-100 text-black'
          }`}
          title={getTranslation(language, 'italic')}
        >
          <Italic className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Underline Button */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            executeCommand('underline');
          }}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
            darkMode ? 'hover:bg-neutral-800 text-white' : 'hover:bg-neutral-100 text-black'
          }`}
          title={getTranslation(language, 'underline')}
        >
          <Underline className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className={`w-[1px] h-5 mx-0.5 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`} />

        {/* Text Size Selector Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowSizePicker(!showSizePicker);
              setShowColorPicker(false);
              setShowHighlightPicker(false);
            }}
            className={`h-8 px-2.5 rounded-lg flex items-center space-x-1 text-xs font-bold transition cursor-pointer ${
              showSizePicker 
                ? (darkMode ? 'bg-white text-black' : 'bg-black text-white') 
                : (darkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-800')
            }`}
            title={getTranslation(language, 'size')}
          >
            <Type className="w-3.5 h-3.5" />
            <span>{getTranslation(language, 'size')}</span>
          </button>

          {showSizePicker && (
            <div className={`absolute top-10 left-0 z-30 border rounded-xl p-1.5 shadow-xl w-32 space-y-1 animate-in fade-in duration-150 ${
              darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
            }`}>
              {FONT_SIZES.map(f => (
                <button
                  key={f.name}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSetSize(f.sizeVal);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold flex items-center justify-between text-xs cursor-pointer ${
                    darkMode ? 'hover:bg-neutral-800 text-white' : 'hover:bg-neutral-100 text-black'
                  }`}
                >
                  <span>{f.name}</span>
                  <span className={`text-[10px] ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>{f.px}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Color Picker Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowSizePicker(false);
              setShowHighlightPicker(false);
            }}
            className={`h-8 px-2.5 rounded-lg flex items-center space-x-1 text-xs font-bold transition cursor-pointer ${
              showColorPicker 
                ? (darkMode ? 'bg-white text-black' : 'bg-black text-white') 
                : (darkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-800')
            }`}
            title={getTranslation(language, 'color')}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{getTranslation(language, 'color')}</span>
          </button>

          {showColorPicker && (
            <div className={`absolute top-10 left-0 z-30 border rounded-xl p-2.5 shadow-xl w-48 space-y-2 animate-in fade-in duration-150 ${
              darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">{getTranslation(language, 'color')}</span>
              <div className="grid grid-cols-4 gap-2">
                {currentColors.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSetColor(c.value);
                    }}
                    className={`w-7 h-7 rounded-full ${c.bg} hover:scale-110 active:scale-95 transition cursor-pointer shadow-xs border ${
                      darkMode ? 'border-neutral-700' : 'border-neutral-200'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlight Color Picker Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowSizePicker(false);
              setShowColorPicker(false);
            }}
            className={`h-8 px-2.5 rounded-lg flex items-center space-x-1 text-xs font-bold transition cursor-pointer ${
              showHighlightPicker 
                ? (darkMode ? 'bg-white text-black' : 'bg-black text-white') 
                : (darkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-800')
            }`}
            title={getTranslation(language, 'highlight')}
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>{getTranslation(language, 'highlight')}</span>
          </button>

          {showHighlightPicker && (
            <div className={`absolute top-10 left-0 z-30 border rounded-xl p-2.5 shadow-xl w-48 space-y-2 animate-in fade-in duration-150 ${
              darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">{getTranslation(language, 'highlight')}</span>
              <div className="grid grid-cols-3 gap-2">
                {HIGHLIGHT_COLORS.map(h => (
                  <button
                    key={h.name}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSetHighlight(h.value);
                    }}
                    className={`h-7 rounded-md ${h.bg} text-[10px] font-bold hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center`}
                    title={h.name}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear Format */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleClearFormatting();
          }}
          className={`h-8 px-2 rounded-lg transition cursor-pointer text-xs flex items-center space-x-1 ${
            darkMode ? 'hover:bg-neutral-800 text-neutral-500 hover:text-white' : 'hover:bg-neutral-100 text-neutral-400 hover:text-black'
          }`}
          title={getTranslation(language, 'clearFormat')}
        >
          <RotateCcw className="w-3 h-3" />
        </button>

        {/* Optional 100% Offline Script Converter when Punjabi / Urdu / Sanskrit is selected */}
        {(language === 'pa' || language === 'ur' || language === 'sa') && (
          <button
            type="button"
            onClick={handleOfflineTranslateNote}
            className={`h-8 px-2.5 rounded-lg transition cursor-pointer text-xs font-bold flex items-center space-x-1.5 ml-auto ${
              darkMode 
                ? 'bg-sky-950/60 text-sky-300 hover:bg-sky-900/80 border border-sky-800/60' 
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
            }`}
            title={getTranslation(language, 'offlineTranslate')}
          >
            <Languages className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">{getTranslation(language, 'translateContent')}</span>
          </button>
        )}
      </div>

      {/* Main Formatted Writing Canvas */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={getTranslation(language, 'editorPlaceholder')}
        className={`w-full min-h-[450px] bg-transparent text-base sm:text-lg focus:outline-none leading-relaxed font-normal empty:before:content-[attr(data-placeholder)] empty:before:pointer-events-none pb-12 ${
          darkMode 
            ? 'text-white empty:before:text-neutral-600' 
            : 'text-black empty:before:text-neutral-300'
        }`}
      />

      {/* Bottom Status Bar */}
      <div className={`mt-8 pt-4 border-t flex items-center justify-between text-xs select-none ${
        darkMode ? 'border-neutral-800 text-neutral-500' : 'border-neutral-100 text-neutral-400'
      }`}>
        <span>{words} {getTranslation(language, 'words')} • {chars} {getTranslation(language, 'characters')}</span>
        <span className={`font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{getTranslation(language, 'autoSaved')}</span>
      </div>
    </div>
  );
}
