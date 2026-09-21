import React, { useState, useRef } from 'react';
import { Note } from '../types';
import { Trash2, Search, Clock, Pin, MoreVertical, X, Sparkles, Download } from 'lucide-react';
import { downloadNoteAsPdf, downloadQuizAsPdf } from '../utils/pdfExport';

interface NotepadListViewProps {
  notes: Note[];
  searchQuery: string;
  activeNoteId?: string;
  darkMode?: boolean;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: string, e?: React.MouseEvent) => void;
  onTogglePin: (id: string, e?: React.MouseEvent) => void;
  onClearSearch: () => void;
}

export default function NotepadListView({
  notes,
  searchQuery,
  activeNoteId,
  darkMode = false,
  onSelectNote,
  onDeleteNote,
  onTogglePin,
  onClearSearch
}: NotepadListViewProps) {
  const [menuNote, setMenuNote] = useState<Note | null>(null);

  // Long press timer ref for mobile touch
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef<boolean>(false);

  const handleTouchStart = (note: Note) => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setMenuNote(note);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(40);
      }
    }, 400);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleClick = (note: Note) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    onSelectNote(note);
  };

  if (notes.length === 0) {
    if (searchQuery) {
      return (
        <div className="max-w-md mx-auto py-16 text-center space-y-3 px-4 safe-bottom-pad">
          <Search className={`w-10 h-10 mx-auto ${darkMode ? 'text-neutral-700' : 'text-neutral-300'}`} />
          <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
            No notes match "{searchQuery}"
          </p>
          <button
            onClick={onClearSearch}
            className={`min-h-[44px] px-4 text-xs underline font-medium cursor-pointer ${
              darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Clear Search
          </button>
        </div>
      );
    }
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-3 px-4 safe-bottom-pad">
        <p className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
          No saved notes yet
        </p>
        <p className="text-xs sm:text-sm text-neutral-400">
          Tap the (+) button below to create a Note or Quiz
        </p>
      </div>
    );
  }

  const pinnedNotes = notes.filter(n => n.isPinned);
  const unpinnedNotes = notes.filter(n => !n.isPinned);

  const renderNoteCard = (note: Note) => {
    const isActive = note.id === activeNoteId;
    const formattedDate = new Date(note.updatedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const isQuiz = note.type === 'quiz';
    const questionCount = note.questions ? note.questions.length : 0;
    const firstQ = note.questions && note.questions.length > 0 ? note.questions[0].question : '';

    return (
      <div
        key={note.id}
        onTouchStart={() => handleTouchStart(note)}
        onTouchEnd={handleTouchEnd}
        onMouseDown={() => handleTouchStart(note)}
        onMouseUp={handleTouchEnd}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuNote(note);
        }}
        onClick={() => handleClick(note)}
        className={`py-4 px-3.5 sm:px-4 -mx-2 sm:-mx-3 rounded-xl cursor-pointer transition select-none flex items-start justify-between gap-3 group min-h-[58px] ${
          isActive 
            ? (darkMode ? 'bg-neutral-900' : 'bg-neutral-100') 
            : (darkMode ? 'hover:bg-neutral-900/60 active:bg-neutral-900' : 'hover:bg-neutral-50 active:bg-neutral-100')
        }`}
      >
        {/* Left text info */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            {note.isPinned && (
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-bold rounded-md ${
                darkMode ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black'
              }`}>
                <Pin className={`w-2.5 h-2.5 ${darkMode ? 'fill-white' : 'fill-black'}`} />
                <span>Pinned</span>
              </span>
            )}
            {isQuiz && (
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold rounded-md ${
                darkMode ? 'bg-white text-black' : 'bg-black text-white'
              }`}>
                <Sparkles className="w-2.5 h-2.5" />
                <span>Quiz ({questionCount} Qs)</span>
              </span>
            )}
            <h4 className={`font-bold text-base sm:text-lg truncate ${darkMode ? 'text-white' : 'text-black'}`}>
              {note.title.trim() || (isQuiz ? 'Untitled Quiz' : 'Untitled Note')}
            </h4>
          </div>

          <p className="text-xs sm:text-sm text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
            {isQuiz 
              ? (firstQ ? `Q.1 ${firstQ}` : `${questionCount} MCQ Questions`) 
              : (note.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '(Empty note)')
            }
          </p>

          <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-neutral-500">
            <Clock className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Right side: 3 dots option button with safe 44px touch target */}
        <div className="flex items-center shrink-0 pt-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuNote(note);
            }}
            className={`w-10 h-10 -mr-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
              darkMode 
                ? 'hover:bg-neutral-800 active:bg-neutral-700 text-neutral-500 hover:text-white' 
                : 'hover:bg-neutral-200 active:bg-neutral-300 text-neutral-400 hover:text-black'
            }`}
            title="Options (Pin / Delete)"
            aria-label="Note Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-5 sm:py-6 px-4 sm:px-8 md:px-12 space-y-6 safe-bottom-pad">
      {/* Header line showing count or search query */}
      <div className={`flex items-center justify-between pb-3 border-b text-xs sm:text-sm font-bold uppercase tracking-wider ${
        darkMode ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-500'
      }`}>
        <span>
          {searchQuery ? `Search Results (${notes.length})` : `Saved Notes (${notes.length})`}
        </span>
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className={`min-h-[36px] px-2 font-semibold lowercase transition cursor-pointer flex items-center ${
              darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'
            }`}
          >
            clear search
          </button>
        )}
      </div>

      {/* Pinned section */}
      {!searchQuery && pinnedNotes.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1 px-1">
            <Pin className="w-3 h-3 fill-neutral-400" />
            <span>Pinned</span>
          </div>
          <div className={`divide-y ${darkMode ? 'divide-neutral-850' : 'divide-neutral-100'}`}>
            {pinnedNotes.map(renderNoteCard)}
          </div>
        </div>
      )}

      {/* Other / All notes section */}
      <div className="space-y-1.5">
        {!searchQuery && pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 pt-3 px-1">
            <span>All Notes</span>
          </div>
        )}
        <div className={`divide-y ${darkMode ? 'divide-neutral-850' : 'divide-neutral-100'}`}>
          {(searchQuery ? notes : unpinnedNotes).map(renderNoteCard)}
        </div>
      </div>

      {/* Note Action Modal / Bottom Sheet with safe insets */}
      {menuNote && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setMenuNote(null)}
        >
          <div 
            className={`w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4 duration-200 pb-[max(calc(env(safe-area-inset-bottom)+20px),24px)] ${
              darkMode ? 'bg-neutral-900 border border-neutral-800 text-white' : 'bg-white text-black'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className={`flex items-start justify-between border-b pb-3 ${darkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
              <div className="flex-1 pr-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  {menuNote.type === 'quiz' ? 'Quiz Options' : 'Note Options'}
                </span>
                <h3 className={`font-bold text-base sm:text-lg truncate mt-0.5 ${darkMode ? 'text-white' : 'text-black'}`}>
                  {menuNote.title.trim() || (menuNote.type === 'quiz' ? 'Untitled Quiz' : 'Untitled Note')}
                </h3>
              </div>
              <button 
                onClick={() => setMenuNote(null)}
                className={`w-9 h-9 -mr-1 rounded-full cursor-pointer flex items-center justify-center ${
                  darkMode ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-400 hover:text-black'
                }`}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons: 1. Download PDF, 2. Pin / Unpin, 3. Delete */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => {
                  if (menuNote.type === 'quiz') {
                    downloadQuizAsPdf(menuNote.title, menuNote.questions || []);
                  } else {
                    downloadNoteAsPdf(menuNote.title, menuNote.content, menuNote.updatedAt);
                  }
                  setMenuNote(null);
                }}
                className={`w-full min-h-[50px] flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm sm:text-base transition cursor-pointer ${
                  darkMode 
                    ? 'bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white' 
                    : 'bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-black'
                }`}
              >
                <Download className="w-5 h-5" />
                <span>Download as PDF</span>
              </button>

              <button
                onClick={(e) => {
                  onTogglePin(menuNote.id, e);
                  setMenuNote(null);
                }}
                className={`w-full min-h-[50px] flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm sm:text-base transition cursor-pointer ${
                  darkMode 
                    ? 'bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white' 
                    : 'bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-black'
                }`}
              >
                <Pin className={`w-5 h-5 ${menuNote.isPinned ? (darkMode ? 'fill-white' : 'fill-black') : ''}`} />
                <span>{menuNote.isPinned ? 'Unpin' : 'Pin to Top'}</span>
              </button>

              <button
                onClick={(e) => {
                  onDeleteNote(menuNote.id, e);
                  setMenuNote(null);
                }}
                className={`w-full min-h-[50px] flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm sm:text-base transition cursor-pointer ${
                  darkMode 
                    ? 'bg-red-950/40 hover:bg-red-900/50 active:bg-red-900 text-red-400 border border-red-900/50' 
                    : 'bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600'
                }`}
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete</span>
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setMenuNote(null)}
              className={`w-full min-h-[44px] py-2 text-center text-xs sm:text-sm font-bold transition cursor-pointer ${
                darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
